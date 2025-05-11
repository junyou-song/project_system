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
  App,
  Modal,
  Spin,
  Tooltip
} from 'antd';
import { 
  ImportOutlined,
  ExportOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import FadeIn from '@/components/transitions/FadeIn';
import type { ColumnsType } from 'antd/es/table';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { rebateService } from '@/services/rebateService';
import {
  CreateRebateRequest,
  CreateRebateDetailRequestItem,
  RebateStatus,
} from '@/types/Rebate/rebate';
import { useNavigation } from '@/hooks/useNavigation';
import { useRebateLookups } from '@/hooks/useRebateLookups';
import { useRebateCascadingLookups } from '@/hooks/useRebateCascadingLookups';
import { useRebateItemManager } from '@/hooks/useRebateItemManager';
import type { RebateItemDetail } from '@/types/Rebate/rebate';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 主组件
function RebateNewPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<Pick<CreateRebateRequest, 'corporationId' | 'categoryId' | 'salesDeptId' | 'budgetDeptId' | 'periodStart' | 'periodEnd' | 'title' | 'description'>>();
  const { navigateTo, navigateWithConfirm, goBack } = useNavigation();

  // 状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  
  // 表单是否被修改标记
  const [formModified, setFormModified] = useState(false);

  // 从自定义Hook获取下拉选项数据
  const {
    corporations,
    categories,
    salesDepts,
    budgetDepts,
    priceTypes,
    applicationTypes,
    dataLoading, // 使用Hook中的dataLoading状态
  } = useRebateLookups();

  // 当前选择的法人ID
  const [selectedCorporationId, setSelectedCorporationId] = useState<string | undefined>(undefined);
  // 当前弹窗内选择的大分类ID
  const [selectedModalBigCategoryId, setSelectedModalBigCategoryId] = useState<string | undefined>(undefined);
  // 当前弹窗内选择的中分类ID
  const [selectedModalMiddleCategoryId, setSelectedModalMiddleCategoryId] = useState<string | undefined>(undefined);

  // 从自定义Hook获取级联下拉选项数据
  const {
    bigCategories,
    middleCategories,
    models,
  } = useRebateCascadingLookups({
    selectedCorporationId: selectedCorporationId, // 主表单选择的法人ID
    selectedBigCategoryId: selectedModalBigCategoryId, // 弹窗内选择的大分类ID
    selectedMiddleCategoryId: selectedModalMiddleCategoryId, // 弹窗内选择的中分类ID
  });

  // 返利明细管理 Hook
  const {
    itemForm, // 返利明细弹窗的Ant Design表单实例
    tableData, // 当前表格中返利明细的数组
    selectedRowKeys, // 表格中当前选中行的Key数组
    setSelectedRowKeys, // selectedRowKeys的setter函数
    modalVisible, // 添加/编辑明细弹窗的可见状态
    modalLoading, // 弹窗的加载状态
    editingKey, // 当前正在编辑的明细的Key，如果是新增则为空字符串
    selectedItemTypeInModal, // 弹窗内选中的申请类型ID
    handleAddRow, // 初始化添加新返利明细的处理函数 (主表单校验通过后打开弹窗)。
    handleDeleteRows, // 从表格中删除所有选中行的处理函数。
    handleEditRow, // 初始化编辑现有返利明细的处理函数 (使用记录数据打开弹窗)。
    handleTableChange, // 表格内编辑的处理函数 (例如，修改数量、价格类型)。
    handleModalSubmit, // 提交明细弹窗表单的处理函数 (添加/更新明细)。
    handleModalCancel, // 取消/关闭明细弹窗的处理函数。
    handleApplicationTypeChangeInModal, // 弹窗内申请类型变化的处理函数。
    totalRebateAmount, // 表格中所有明细计算得出的总返利金额。
  } = useRebateItemManager({
    priceTypes,
    allBigCategories: bigCategories,
    allMiddleCategories: middleCategories,
    allModels: models,
    applicationTypes,
    mainForm: form,
    setFormModified,
    setSelectedModalBigCategoryId,
    setSelectedModalMiddleCategoryId,
  });

  // 法人变更后，弹窗内大分类ID重置
  useEffect(() => {
    setSelectedModalBigCategoryId(undefined);
    setSelectedModalMiddleCategoryId(undefined);
    itemForm.resetFields(['bigCategoryId', 'middleCategoryId', 'modelId']);
  }, [selectedCorporationId, itemForm]);

  // 大分类变更后，弹窗内中分类ID重置
  useEffect(() => {
    setSelectedModalMiddleCategoryId(undefined);
    itemForm.resetFields(['middleCategoryId', 'modelId']);
  }, [selectedModalBigCategoryId, itemForm]);

  // 中分类变更后，弹窗内型号ID重置
  useEffect(() => {
    itemForm.resetFields(['modelId']);
  }, [selectedModalMiddleCategoryId, itemForm]);

  const handleFormValuesChange = (changedValues: any) => {
    if ('corporationId' in changedValues) {
      setSelectedCorporationId(changedValues.corporationId);
    }
    setFormModified(true);
  };

  const columns: ColumnsType<RebateItemDetail> = [
    {
      title: '大分类',
      dataIndex: 'bigCategoryName',
      key: 'bigCategoryName',
      width: 120,
      render: (name?: string) => name || '-'
    },
    {
      title: '中分类',
      dataIndex: 'middleCategoryName',
      key: 'middleCategoryName',
      width: 120,
      render: (name?: string) => name || '-'
    },
    {
      title: '型号',
      dataIndex: 'modelCode',
      key: 'modelCode',
      width: 120,
      render: (code?: string) => (
        <Tooltip placement="topLeft" title={code || ''}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {code || '-'}
          </div>
        </Tooltip>
      )
    },
    {
      title: '价格类型',
      dataIndex: 'priceTypeId',
      key: 'priceTypeId',
      width: 120,
      render: (priceTypeId: string, record) => (
        <Select
          value={priceTypeId}
          style={{ width: '100%' }}
          placeholder="选择价格类型"
          onChange={(value) => handleTableChange(record.key, 'priceTypeId', value)}
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
      width: 80,
      render: (price: number, record) => {
        return price ?? '-'; 
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number | undefined, record) => (
        <InputNumber
          value={quantity}
          style={{ width: '100%' }}
          min={1}
          precision={0}
          onChange={(value) => handleTableChange(record.key, 'quantity', value ?? 0)}
        />
      )
    },
    {
      title: '返利值',
      key: 'rebateValue',
      width: 120,
      render: (_, record) => {
        if (record.applicationTypeId === 'app-001') {
          return (
            <InputNumber
              value={record.rebatePrice}
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              onChange={(value) => handleTableChange(record.key, 'rebatePrice', value ?? undefined)}
              addonAfter="元"
              placeholder="输入单价"
            />
          );
        } else if (record.applicationTypeId === 'app-002') {
          return (
            <InputNumber
              value={record.rebateRate}
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              onChange={(value) => handleTableChange(record.key, 'rebateRate', value ?? undefined)}
              addonAfter="%"
              placeholder="输入百分比"
            />
          );
        }
        return '-';
      }
    },
    {
      title: '申请金额',
      dataIndex: 'itemRebateAmount',
      key: 'itemRebateAmount',
      width: 100,
      render: (amount?: number) => (
        <span>{amount !== undefined && amount !== null ? amount.toFixed(2) : '-'}</span>
      )
    },
    {
      title: '明细备注',
      dataIndex: 'comment',
      key: 'comment',
      width: 150,
      render: (comment: string | undefined, record) => (
        <Input
          value={comment}
          onChange={(e) => handleTableChange(record.key, 'comment', e.target.value)}
          placeholder="输入备注"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEditRow(record)}>
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      const mainFormValues = await form.validateFields() as Pick<CreateRebateRequest, 'corporationId' | 'categoryId' | 'salesDeptId' | 'budgetDeptId' | 'periodStart' | 'periodEnd' | 'title' | 'description'>;

      if (tableData.length === 0) {
        message.error('请添加至少一条返利明细');
        return;
      }

      const details: CreateRebateDetailRequestItem[] = tableData.map(item => {
        const { key, itemRebateAmount, bigCategoryName, middleCategoryName, modelCode, priceTypeName, ...detailData } = item;
        return detailData;
      });

      for (let i = 0; i < details.length; i++) {
        const item = details[i];
        if (
          !item.modelId || 
          !item.priceTypeId || 
          !(item.quantity > 0) || 
          (item.applicationTypeId === 'app-001' && (item.rebatePrice === undefined || item.rebatePrice === null || !(item.rebatePrice >= 0))) || 
          (item.applicationTypeId === 'app-002' && (item.rebateRate === undefined || item.rebateRate === null || !(item.rebateRate >= 0))) || 
          (item.applicationTypeId === 'app-002' && (item.price === undefined || item.price === null || !(item.price >= 0)))
        ) {
          message.error(`第 ${i + 1} 行返利明细数据不完整或无效，请检查`);
          return;
        }
      }
      
      setSubmitLoading(!isDraft);
      setDraftLoading(isDraft);
      
      const createRequest: CreateRebateRequest = {
        corporationId: mainFormValues.corporationId,
        categoryId: mainFormValues.categoryId,
        salesDeptId: mainFormValues.salesDeptId,
        budgetDeptId: mainFormValues.budgetDeptId,
        periodStart: dayjs(mainFormValues.periodStart).format('YYYY-MM-DD'), 
        periodEnd: dayjs(mainFormValues.periodEnd).format('YYYY-MM-DD'),
        title: mainFormValues.title,
        description: mainFormValues.description,
        details: details
      };
      
      const result = await rebateService.createRebate(createRequest);
      
      if (isDraft && result.id) {
        await rebateService.updateRebate({
          id: result.id,
          status: RebateStatus.DRAFT,
        } as any);
      }
      
      setFormModified(false);
      navigateTo('/main/rebate/use/overviewpage', {
        loadingMessage: `返利申请${isDraft ? '草稿保存' : '创建'}成功，正在返回一览页...`,
        onComplete: () => {
          message.success(`返利申请${isDraft ? '草稿保存' : '创建'}成功`);
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

  const handleSaveDraft = () => {
    setDraftLoading(true);
    handleSubmit(true);
  };

  const handleReturn = () => {
    if (formModified && tableData.length > 0) {
      navigateWithConfirm('/main/rebate/use/overviewpage', {
        shouldConfirm: true, 
        confirmMessage: '您有未保存的返利申请数据，确定要离开吗？',
        loadingMessage: '正在返回一览页...'
      });
    } else {
      goBack('/main/rebate/use/overviewpage', 2000, '正在返回一览页...');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    }
  };

  return (
    <div className="rebate-new-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F5F5', padding: '0 0 24px' }}>
      <Modal
        title={editingKey ? "编辑返利明细" : "添加返利明细"}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={modalLoading}
            onClick={handleModalSubmit}
            style={{ 
              background: 'linear-gradient(90deg, #1677ff 0%, #1890ff 100%)',
              border: 'none',
              boxShadow: '0 2px 0 rgba(5, 125, 255, 0.1)'
            }}
          >
            确定
          </Button>
        ]}
        width={700}
      >
        <Spin spinning={modalLoading}>
          <Form
            form={itemForm}
            layout="vertical"
            requiredMark={true}
            name="itemForm"
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="bigCategoryId"
                  label="大分类"
                  rules={[{ required: true, message: '请选择大分类' }]}
                >
                  <Select 
                    placeholder={selectedCorporationId ? "选择大分类" : "请先选择法人"}
                    disabled={!selectedCorporationId || dataLoading}
                    onChange={(value) => {
                      setSelectedModalBigCategoryId(value);
                      itemForm.setFieldsValue({ middleCategoryId: undefined, modelId: undefined });
                      setSelectedModalMiddleCategoryId(undefined);
                    }}
                  >
                    {bigCategories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="middleCategoryId"
                  label="中分类"
                  rules={[{ required: true, message: '请选择中分类' }]}
                >
                  <Select 
                    placeholder={!selectedModalBigCategoryId 
                      ? "请先选择大分类" 
                      : (middleCategories.length === 0 ? "该大分类下无中分类" : "选择中分类")
                    }
                    disabled={!selectedModalBigCategoryId || middleCategories.length === 0}
                    onChange={(value) => {
                      setSelectedModalMiddleCategoryId(value);
                      itemForm.setFieldsValue({ modelId: undefined });
                    }}
                  >
                    {middleCategories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modelId"
                  label="型号"
                  rules={[{ required: true, message: '请选择型号' }]}
                >
                  <Select 
                    placeholder={!selectedModalMiddleCategoryId
                      ? "请先选择中分类"
                      : (models.length === 0 ? "该中分类下无型号" : "选择型号")
                    }
                    disabled={!selectedModalMiddleCategoryId || models.length === 0}
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {models.map(model => (
                      <Option key={model.id} value={model.id}>{model.code}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="applicationTypeId"
                  label="申请类型"
                  rules={[{ required: true, message: '请选择申请类型' }]}
                >
                  <Select 
                    placeholder="选择申请类型"
                    onChange={handleApplicationTypeChangeInModal}
                  >
                    {applicationTypes.map(type => (
                      <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="priceTypeId"
                  label="价格类型"
                  rules={[{ required: true, message: '请选择价格类型' }]}
                >
                  <Select placeholder="选择价格类型">
                    {priceTypes.map(type => (
                      <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="数量"
                  rules={[{ required: true, message: '请输入数量' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={1}
                    precision={0}
                  />
                </Form.Item>
              </Col>
              {selectedItemTypeInModal === 'app-001' && (
                <Col span={8}>
                  <Form.Item
                    name="rebatePrice"
                    label="申请单价（元）"
                    rules={[{ required: true, message: '请输入申请单价' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0}
                      step={0.01}
                      precision={2}
                      addonAfter="元"
                    />
                  </Form.Item>
                </Col>
              )}
              {selectedItemTypeInModal === 'app-002' && (
                <Col span={8}>
                  <Form.Item
                    name="rebateRate"
                    label="申请率（%）"
                    rules={[{ required: true, message: '请输入申请率' }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={0}
                      max={100}
                      step={0.01}
                      precision={2}
                      addonAfter="%"
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Form.Item
                  name="comment"
                  label="明细备注"
                >
                  <TextArea 
                    rows={2} 
                    placeholder="请输入该条明细的备注信息"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>

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

      <FadeIn delay={0.1}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>基本信息</span>
            </div>
          }
          variant="borderless"
          style={{ 
            marginBottom: 16, 
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)',
            background: 'white'
          }}
          styles={{ 
            header: { padding: '8px 16px' },
            body: { padding: '8px 16px 4px' } 
          }}
          size="small"
        >
          <Form 
            form={ form }
            layout="vertical"
            onValuesChange={handleFormValuesChange}
            initialValues={{
              periodStart: dayjs(),
              periodEnd: dayjs().add(1, 'month')
            }}
            size="middle"
            requiredMark={true}
            name="rebateForm"
          >
            <Row gutter={[12, 0]}>
              <Col span={4}>
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
              <Col span={4}>
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
              <Col span={4}>
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
              <Col span={4}>
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
              <Col span={4}>
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
              <Col span={4}>
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
                总计: {totalRebateAmount} 元 
              </div>
            )}
          />
        </Card>
      </FadeIn>

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

export default function RebateNewWithAppContext() {
  return (
    <App>
      <RebateNewPage />
    </App>
  );
}
