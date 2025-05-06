'use client';
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Input, 
  Form, 
  Table,
  InputNumber,
  Space,
  message,
  App
} from 'antd';
import { 
  ImportOutlined,
  ExportOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import FadeIn from '@/components/transitions/FadeIn';
import type { ColumnsType } from 'antd/es/table';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { rebateService } from '@/services/rebateService';
import { useRouter } from 'next/navigation';
import { 
  Corporation, 
  Category, 
  SalesDept, 
  BudgetDept, 
  PriceType, 
  Model,
  CreateRebateRequest,
  RebateStatus
} from '@/types/Rebate/rebate';
import { useNavigation } from '@/hooks/useNavigation';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 表格行项数据类型
interface RebateItem {
  key: string;
  modelId: string;
  priceTypeId: string;
  price: number;
  quantity: number;
  rebatePrice: number;
  rebateRate: number;
  rebateAmount: number;
  comment?: string;
}

// 主组件
function RebateNewPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const { navigateTo, navigateWithConfirm, goBack } = useNavigation();

  // 状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // 表单是否被修改标记
  const [formModified, setFormModified] = useState(false);

  // 下拉选项数据
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesDepts, setSalesDepts] = useState<SalesDept[]>([]);
  const [budgetDepts, setBudgetDepts] = useState<BudgetDept[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  // 表格数据
  const [tableData, setTableData] = useState<RebateItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 当前选择的法人ID
  const [selectedCorporationId, setSelectedCorporationId] = useState<string | undefined>(undefined);
  
  // 加载下拉选项数据
  useEffect(() => {
    const loadLookupData = async () => {
      setDataLoading(true);
      try {
        const [corporationsData, categoriesData, salesDeptsData, budgetDeptsData, priceTypesData] = 
          await Promise.all([
            rebateService.getCorporations(true),
            rebateService.getCategories(true),
            rebateService.getSalesDepts(true),
            rebateService.getBudgetDepts(true),
            rebateService.getPriceTypes(true),
          ]);
        
        setCorporations(corporationsData);
        setCategories(categoriesData);
        setSalesDepts(salesDeptsData);
        setBudgetDepts(budgetDeptsData);
        setPriceTypes(priceTypesData);
      } catch (error) {
        console.error('加载下拉选项数据失败:', error);
        message.error('加载下拉选项数据失败');
      } finally {
        setDataLoading(false);
      }
    };
    
    loadLookupData();
  }, [message]);

  // 当法人选择变化时加载相应的型号数据
  useEffect(() => {
    const loadModelData = async () => {
      if (!selectedCorporationId) {
        setModels([]);
        return;
      }
      
      try {
        const modelsData = await rebateService.getModels({
          corporationId: selectedCorporationId,
          isActive: true
        });
        setModels(modelsData);
      } catch (error) {
        console.error('加载型号数据失败:', error);
        message.error('加载型号数据失败');
      }
    };
    
    loadModelData();
  }, [selectedCorporationId, message]);

  // 处理表单字段值变化
  const handleFormValuesChange = (changedValues: any) => {
    // 当法人ID变化时更新状态
    if ('corporationId' in changedValues) {
      setSelectedCorporationId(changedValues.corporationId);
    }
    
    // 标记表单已被修改
    setFormModified(true);
  };

  // 添加表格行
  const handleAddRow = () => {
    const newKey = `item-${Date.now()}`;
    const newRow: RebateItem = {
      key: newKey,
      modelId: '',
      priceTypeId: '',
      price: 0,
      quantity: 0,
      rebatePrice: 0,
      rebateRate: 0,
      rebateAmount: 0,
      comment: ''
    };
    
    setTableData([...tableData, newRow]);
  };

  // 删除选中的表格行
  const handleDeleteRows = () => {
    const newData = tableData.filter(item => !selectedRowKeys.includes(item.key));
    setTableData(newData);
    setSelectedRowKeys([]);
  };

  // 计算返利金额
  const calculateRebateAmount = (record: RebateItem, field: string, value: any) => {
    let updatedRecord = { ...record };
    
    switch (field) {
      case 'price':
        updatedRecord.price = Number(value) || 0;
        break;
      case 'quantity':
        updatedRecord.quantity = Number(value) || 0;
        break;
      case 'rebatePrice':
        updatedRecord.rebatePrice = Number(value) || 0;
        // 更新返利率
        if (updatedRecord.price > 0) {
          updatedRecord.rebateRate = Math.round((updatedRecord.rebatePrice / updatedRecord.price) * 100 * 100) / 100;
        }
        break;
      case 'rebateRate':
        updatedRecord.rebateRate = Number(value) || 0;
        // 更新返利价格
        if (updatedRecord.price > 0) {
          updatedRecord.rebatePrice = Math.round((updatedRecord.price * updatedRecord.rebateRate / 100) * 100) / 100;
        }
        break;
    }
    
    // 计算返利总金额
    updatedRecord.rebateAmount = Math.round(updatedRecord.rebatePrice * updatedRecord.quantity * 100) / 100;
    
    return updatedRecord;
  };

  // 处理表格单元格值变化
  const handleCellValueChange = (key: string, field: string, value: any) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        return calculateRebateAmount(item, field, value);
      }
      return item;
    });
    
    setTableData(newData);
  };

  // 表格列定义
  const columns: ColumnsType<RebateItem> = [
    {
      title: '型号',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 160,
      render: (modelId: string, record) => (
        <Select
          value={modelId}
          style={{ width: '100%' }}
          placeholder="选择型号"
          onChange={(value) => handleCellValueChange(record.key, 'modelId', value)}
          showSearch
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {models.map(model => (
            <Option key={model.id} value={model.id}>{model.code}</Option>
          ))}
        </Select>
      )
    },
    {
      title: '价格类型',
      dataIndex: 'priceTypeId',
      key: 'priceTypeId',
      width: 160,
      render: (priceTypeId: string, record) => (
        <Select
          value={priceTypeId}
          style={{ width: '100%' }}
          placeholder="选择价格类型"
          onChange={(value) => handleCellValueChange(record.key, 'priceTypeId', value)}
        >
          {priceTypes.map(type => (
            <Option key={type.id} value={type.id}>{type.name}</Option>
          ))}
        </Select>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record) => (
        <InputNumber
          value={price}
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          precision={2}
          onChange={(value) => handleCellValueChange(record.key, 'price', value)}
        />
      )
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record) => (
        <InputNumber
          value={quantity}
          style={{ width: '100%' }}
          min={0}
          onChange={(value) => handleCellValueChange(record.key, 'quantity', value)}
        />
      )
    },
    {
      title: '返利单价(円)',
      dataIndex: 'rebatePrice',
      key: 'rebatePrice',
      width: 140,
      render: (rebatePrice: number, record) => (
        <InputNumber
          value={rebatePrice}
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          precision={2}
          onChange={(value) => handleCellValueChange(record.key, 'rebatePrice', value)}
          addonAfter={<CalculatorOutlined />}
        />
      )
    },
    {
      title: '返利率(%)',
      dataIndex: 'rebateRate',
      key: 'rebateRate',
      width: 120,
      render: (rebateRate: number, record) => (
        <InputNumber
          value={rebateRate}
          style={{ width: '100%' }}
          min={0}
          max={100}
          step={0.01}
          precision={2}
          onChange={(value) => handleCellValueChange(record.key, 'rebateRate', value)}
          addonAfter="%"
        />
      )
    },
    {
      title: '申请金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      width: 120,
      render: (rebateAmount: number) => (
        <span>{rebateAmount.toFixed(2)}</span>
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string, record) => (
        <Input
          value={comment}
          onChange={(e) => handleCellValueChange(record.key, 'comment', e.target.value)}
          placeholder="备注"
        />
      )
    }
  ];

  // 计算表格数据总和
  const calcTotalAmount = () => {
    return tableData.reduce((sum, item) => sum + item.rebateAmount, 0).toFixed(2);
  };

  // 提交表单处理
  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      // 验证基础表单
      const formValues = await form.validateFields();

      // 验证表格数据
      if (tableData.length === 0) {
        message.error('请添加至少一条返利明细');
        return;
      }

      // 验证表格必填项
      const invalidRow = tableData.findIndex(item => 
        !item.modelId || !item.priceTypeId || item.price <= 0 || item.quantity <= 0 || item.rebatePrice <= 0);
      
      if (invalidRow !== -1) {
        message.error(`第 ${invalidRow + 1} 行数据不完整，请检查必填项和数值`);
        return;
      }

      setSubmitLoading(true);
      
      // 准备提交数据
      const firstItem = tableData[0]; // 使用第一条明细数据
      const createRequest: CreateRebateRequest = {
        corporationId: formValues.corporationId,
        categoryId: formValues.categoryId,
        salesDeptId: formValues.salesDeptId,
        budgetDeptId: formValues.budgetDeptId,
        modelIds: [firstItem.modelId], // 目前仅支持一种型号
        periodStart: formValues.periodStart.format('YYYY-MM-DD'),
        periodEnd: formValues.periodEnd.format('YYYY-MM-DD'),
        priceTypeId: firstItem.priceTypeId,
        price: firstItem.price,
        quantity: firstItem.quantity,
        applicationType: formValues.applicationType || '常规申请',
        rebatePrice: firstItem.rebatePrice,
        title: formValues.title,
        description: formValues.description,
        comment: firstItem.comment || formValues.comment
      };
      
      // 创建返利申请
      const result = await rebateService.createRebate(createRequest);
      
      // 如果是草稿，更新状态为草稿
      if (isDraft && result.id) {
        await rebateService.updateRebate(result.id, { status: RebateStatus.DRAFT });
      }
      
      // 清除表单修改标记
      setFormModified(false);
      
      // 使用导航钩子跳转到一览页面
      navigateTo('/main/rebate/use/overviewpage', {
        loadingMessage: '返利申请创建成功，正在返回一览页...',
        onComplete: () => {
          message.success('返利申请创建成功');
        }
      });
      
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error('提交表单失败，请检查输入数据');
    } finally {
      setSubmitLoading(false);
      setDraftLoading(false);
    }
  };

  // 保存为草稿
  const handleSaveDraft = () => {
    setDraftLoading(true);
    handleSubmit(true);
  };

  // 返回一览页
  const handleReturn = () => {
    if (formModified && tableData.length > 0) {
      // 如果表单已修改，提示用户确认
      navigateWithConfirm('/main/rebate/use/overviewpage', {
        shouldConfirm: true, 
        confirmMessage: '您有未保存的返利申请数据，确定要离开吗？',
        loadingMessage: '正在返回一览页...'
      });
    } else {
      // 直接返回
      goBack('/main/rebate/use/overviewpage', 2000, '正在返回一览页...');
    }
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    }
  };

  return (
    <div className="rebate-new-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F5F5', padding: '0 0 24px' }}>
      <FadeIn>
        <div className="page-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          background: 'linear-gradient(135deg, #f6f8ff 0%, #f0f5ff 100%)',
          padding: '24px 24px 20px',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>返利申请</Title>
            <Paragraph style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              创建新的返利申请记录
            </Paragraph>
          </div>
        </div>
      </FadeIn>

      {/* 基本信息表单 */}
      <FadeIn delay={0.1}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>基本信息</span>
            </div>
          }
          variant="borderless"
          style={{ 
            marginBottom: 24, 
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)',
            background: 'white'
          }}
          styles={{ 
            header: { padding: '12px 16px' },
            body: { padding: '12px 16px 8px' } 
          }}
          size="small"
        >
          <Form 
            form={form}
            layout="vertical"
            onValuesChange={handleFormValuesChange}
            initialValues={{
              periodStart: dayjs(),
              periodEnd: dayjs().add(1, 'month')
            }}
            size="middle"
            requiredMark={false}
          >
            <Row gutter={[16, 0]}>
              <Col span={6}>
                <Form.Item
                  label="法人"
                  name="corporationId"
                  rules={[{ required: true, message: '请选择法人' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select 
                    placeholder="选择法人"
                    showSearch
                    loading={dataLoading}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {corporations.map(corp => (
                      <Option key={corp.id} value={corp.id}>{corp.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="返利区分"
                  name="categoryId"
                  rules={[{ required: true, message: '请选择返利区分' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select 
                    placeholder="选择返利区分"
                    loading={dataLoading}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="销售区分"
                  name="salesDeptId"
                  rules={[{ required: true, message: '请选择销售区分' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select 
                    placeholder="选择销售区分"
                    loading={dataLoading}
                  >
                    {salesDepts.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="预算分类"
                  name="budgetDeptId"
                  rules={[{ required: true, message: '请选择预算分类' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Select 
                    placeholder="选择预算分类"
                    loading={dataLoading}
                  >
                    {budgetDepts.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="返利开始日期"
                  name="periodStart"
                  rules={[{ required: true, message: '请选择开始日期' }]}
                  style={{ marginBottom: 12 }}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    locale={locale}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="返利结束日期"
                  name="periodEnd"
                  rules={[{ required: true, message: '请选择结束日期' }]}
                  style={{ marginBottom: 12 }}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    locale={locale}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="申请类型"
                  name="applicationType"
                  style={{ marginBottom: 12 }}
                >
                  <Select placeholder="选择申请类型">
                    <Option value="常规申请">常规申请</Option>
                    <Option value="特殊申请">特殊申请</Option>
                    <Option value="紧急申请">紧急申请</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="返利区间"
                  name="range"
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="输入返利区间，如 标准返利" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="标题"
                  name="title"
                  rules={[{ required: true, message: '请输入标题' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="请输入返利申请标题" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="描述"
                  name="description"
                  style={{ marginBottom: 12 }}
                >
                  <Input.TextArea 
                    rows={1} 
                    placeholder="请输入申请描述" 
                    autoSize={{ minRows: 1, maxRows: 2 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </FadeIn>

      {/* 返利明细表格 */}
      <FadeIn delay={0.2}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>返利明细</span>
            </div>
          }
          variant="borderless"
          style={{ 
            marginBottom: 24, 
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)',
            background: 'white'
          }}
          extra={
            <Space>
              <Button 
                icon={<ImportOutlined />}
                style={{ 
                  borderRadius: 8,
                  background: 'white',
                  borderColor: '#d9d9d9',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                导入
              </Button>
              <Button 
                icon={<ExportOutlined />}
                style={{ 
                  borderRadius: 8,
                  background: 'white',
                  borderColor: '#d9d9d9',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                导出
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddRow}
                style={{ 
                  borderRadius: 8,
                  background: 'linear-gradient(90deg, #1677ff 0%, #1890ff 100%)',
                  border: 'none',
                  boxShadow: '0 2px 0 rgba(5, 125, 255, 0.1)'
                }}
              >
                添加
              </Button>
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteRows}
                disabled={selectedRowKeys.length === 0}
                style={{ 
                  borderRadius: 8,
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                删除
              </Button>
            </Space>
          }
        >
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            rowKey="key"
            size="middle"
            bordered
            scroll={{ x: 'max-content' }}
            footer={() => (
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                总计: {calcTotalAmount()} 元
              </div>
            )}
          />
        </Card>
      </FadeIn>

      {/* 底部操作按钮 */}
      <FadeIn delay={0.3}>
        <Card
          variant="borderless"
          style={{ 
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            background: 'white',
            marginBottom: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Space size="large">
              <Button
                onClick={handleReturn}
                style={{ 
                  borderRadius: 8,
                  minWidth: 100,
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                取消
              </Button>
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={draftLoading}
                style={{ 
                  borderRadius: 8,
                  minWidth: 120,
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                onClick={() => handleSubmit()}
                loading={submitLoading}
                style={{ 
                  borderRadius: 8,
                  minWidth: 120,
                  background: 'linear-gradient(90deg, #1677ff 0%, #1890ff 100%)',
                  border: 'none',
                  boxShadow: '0 2px 0 rgba(5, 125, 255, 0.1)'
                }}
              >
                提交申请
              </Button>
            </Space>
          </div>
        </Card>
      </FadeIn>

      <style jsx global>{`
        .ant-select-selector {
          border-radius: 6px !important;
        }
        .ant-btn:not(.sidebar-collapse-button):hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .ant-input, .ant-input-number, .ant-picker {
          border-radius: 6px !important;
        }
      `}</style>
    </div>
  );
}

// 导出包装版本，确保提供App上下文
export default function RebateNewWithAppContext() {
  return (
    <App>
      <RebateNewPage />
    </App>
  );
}
