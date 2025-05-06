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
  App,
  Modal,
  Spin
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
  RebateStatus,
  BigCategory,
  MiddleCategory
} from '@/types/Rebate/rebate';
import { useNavigation } from '@/hooks/useNavigation';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 申请类型选项
const APPLICATION_TYPES = [
  { id: 'app-001', name: '单价申请', description: '按单价计算的返利' },
  { id: 'app-002', name: '返利率申请', description: '按返利率计算的返利' }
];

// 表格行项数据类型
interface RebateItem {
  key: string;
  bigCategoryId: string;
  middleCategoryId: string;
  modelId: string;
  priceTypeId: string;
  price: number;
  quantity: number;
  applicationTypeId: string; // 新增申请类型ID字段
  rebatePrice: number;
  rebateRate: number;
  rebateAmount: number;
  comment?: string;
}

// 主组件
function RebateNewPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm(); // 添加明细表单
  const { navigateTo, navigateWithConfirm, goBack } = useNavigation();

  // 状态
  const [submitLoading, setSubmitLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<string>('app-001'); // 默认单价申请
  
  // 表单是否被修改标记
  const [formModified, setFormModified] = useState(false);

  // 下拉选项数据
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesDepts, setSalesDepts] = useState<SalesDept[]>([]);
  const [budgetDepts, setBudgetDepts] = useState<BudgetDept[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [bigCategories, setBigCategories] = useState<BigCategory[]>([]);
  const [middleCategories, setMiddleCategories] = useState<MiddleCategory[]>([]);

  // 表格数据
  const [tableData, setTableData] = useState<RebateItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 当前选择的法人ID
  const [selectedCorporationId, setSelectedCorporationId] = useState<string | undefined>(undefined);
  // 当前选择的大分类ID
  const [selectedBigCategoryId, setSelectedBigCategoryId] = useState<string | undefined>(undefined);
  // 当前选择的中分类ID
  const [selectedMiddleCategoryId, setSelectedMiddleCategoryId] = useState<string | undefined>(undefined);
  
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

  // 当法人选择变化时加载相应的型号数据和大分类数据
  useEffect(() => {
    const loadRelatedData = async () => {
      if (!selectedCorporationId) {
        setModels([]);
        setBigCategories([]);
        return;
      }
      
      try {
        // 同时获取型号数据和大分类数据
        const [modelsData, bigCategoriesData] = await Promise.all([
          rebateService.getModels({
            corporationId: selectedCorporationId,
            isActive: true
          }),
          rebateService.getBigCategories({
            corporationId: selectedCorporationId,
            isActive: true
          })
        ]);
        
        setModels(modelsData);
        setBigCategories(bigCategoriesData);
      } catch (error) {
        console.error('加载关联数据失败:', error);
        message.error('加载关联数据失败');
      }
    };
    
    loadRelatedData();
  }, [selectedCorporationId, message]);

  // 当大分类选择变化时加载相应的中分类数据
  useEffect(() => {
    const loadMiddleCategories = async () => {
      if (!selectedBigCategoryId) {
        setMiddleCategories([]);
        setSelectedMiddleCategoryId(undefined); // 重置中分类选择
        console.log('没有选择大分类，清空中分类数据');
        return;
      }
      
      console.log('开始加载中分类数据，大分类ID:', selectedBigCategoryId);
      try {
        const middleCategoriesData = await rebateService.getMiddleCategories({
          bigCategoryId: selectedBigCategoryId,
          isActive: true
        });
        
        console.log('获取到中分类数据:', middleCategoriesData);
        setMiddleCategories(middleCategoriesData);
      } catch (error) {
        console.error('加载中分类数据失败:', error);
        message.error('加载中分类数据失败');
      }
    };
    
    loadMiddleCategories();
  }, [selectedBigCategoryId, message]);

  // 处理表单字段值变化
  const handleFormValuesChange = (changedValues: any) => {
    // 当法人ID变化时更新状态
    if ('corporationId' in changedValues) {
      setSelectedCorporationId(changedValues.corporationId);
      // 清空大分类和中分类选择
      form.setFieldsValue({ bigCategoryId: undefined, middleCategoryId: undefined });
      setSelectedBigCategoryId(undefined);
      setSelectedMiddleCategoryId(undefined);
    }
    
    // 标记表单已被修改
    setFormModified(true);
  };

  // 计算返利金额
  const calculateRebateAmount = (values: any) => {
    const { applicationTypeId, price, quantity, rebatePrice, rebateRate } = values;
    let calculatedAmount = 0;
    
    if (applicationTypeId === 'app-001' && typeof rebatePrice === 'number' && rebatePrice > 0) {
      // 单价申请: 返利金额 = 返利单价 × 数量
      calculatedAmount = rebatePrice * quantity;
    } else if (applicationTypeId === 'app-002' && typeof rebateRate === 'number' && rebateRate > 0) {
      // 返利率申请: 返利金额 = 价格 × 数量 × 返利率/100
      calculatedAmount = price * quantity * (rebateRate / 100);
    }
    
    // 保留两位小数
    return Math.round(calculatedAmount * 100) / 100;
  };

  // 处理弹窗表单提交
  const handleModalSubmit = async () => {
    try {
      setModalLoading(true);
      
      // 验证表单
      const values = await itemForm.validateFields();
      
      // 处理返利金额计算
      const newValues = {
        ...values,
        price: 1, // 暂时写死为1
      };
      
      const rebateAmount = calculateRebateAmount(newValues);
      
      // 创建新的数据项
      const newItem: RebateItem = {
        key: editingKey || `item-${Date.now()}`,
        bigCategoryId: values.bigCategoryId,
        middleCategoryId: values.middleCategoryId,
        modelId: values.modelId,
        priceTypeId: values.priceTypeId,
        price: 1, // 暂时写死为1
        quantity: values.quantity,
        applicationTypeId: values.applicationTypeId,
        rebatePrice: values.applicationTypeId === 'app-001' ? values.rebatePrice : 0,
        rebateRate: values.applicationTypeId === 'app-002' ? values.rebateRate : 0,
        rebateAmount: rebateAmount,
        comment: values.comment
      };
      
      if (editingKey) {
        // 更新现有项目
        setTableData(tableData.map(item => item.key === editingKey ? newItem : item));
      } else {
        // 添加新项目
        setTableData([...tableData, newItem]);
      }
      
      setModalVisible(false);
      setEditingKey('');
      setFormModified(true);
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // 处理弹窗中申请类型变更
  const handleApplicationTypeChange = (value: string) => {
    setSelectedItemType(value);
  };

  // 添加表格行 - 现在改为打开弹窗
  const handleAddRow = async () => {
    try {
      // 先验证基本信息表单是否填写完整
      await form.validateFields();
      
      // 基本信息验证通过，打开弹窗
      showItemModal();
    } catch (error) {
      // 基本信息验证失败，显示错误信息
      console.error('基本信息验证失败:', error);
      message.error('请先完成基本信息的必填项');
      
      // 表单验证会自动让未填写的必填字段显示红色边框
    }
  };

  // 删除选中的表格行
  const handleDeleteRows = () => {
    const newData = tableData.filter(item => !selectedRowKeys.includes(item.key));
    setTableData(newData);
    setSelectedRowKeys([]);
    setFormModified(true);
  };

  // 编辑表格行
  const handleEditRow = (record: RebateItem) => {
    showItemModal(record);
  };

  // 打开添加/编辑明细弹窗
  const showItemModal = (record?: RebateItem) => {
    itemForm.resetFields();
    
    if (record) {
      // 编辑现有记录
      setEditingKey(record.key);
      setSelectedItemType(record.applicationTypeId);
      
      // 设置表单值
      itemForm.setFieldsValue({
        bigCategoryId: record.bigCategoryId,
        middleCategoryId: record.middleCategoryId,
        modelId: record.modelId,
        priceTypeId: record.priceTypeId,
        quantity: record.quantity,
        applicationTypeId: record.applicationTypeId,
        rebatePrice: record.applicationTypeId === 'app-001' ? record.rebatePrice : undefined,
        rebateRate: record.applicationTypeId === 'app-002' ? record.rebateRate : undefined,
        comment: record.comment
      });
      
      // 设置大分类ID和中分类ID，触发数据加载
      setSelectedBigCategoryId(record.bigCategoryId);
      setSelectedMiddleCategoryId(record.middleCategoryId);
    } else {
      // 添加新记录
      setEditingKey('');
      // 重置选择的大分类和中分类ID
      setSelectedBigCategoryId(undefined);
      setSelectedMiddleCategoryId(undefined);
      // 设置默认值
      itemForm.setFieldsValue({
        applicationTypeId: 'app-001',
        price: 1, // 暂时写死为1
        quantity: 1
      });
      setSelectedItemType('app-001');
    }
    
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey('');
    setSelectedBigCategoryId(undefined);
    setSelectedMiddleCategoryId(undefined);
  };

  // 表格列定义
  const columns: ColumnsType<RebateItem> = [
    {
      title: '大分类',
      dataIndex: 'bigCategoryId',
      key: 'bigCategoryId',
      width: 120,
      render: (bigCategoryId: string) => {
        const category = bigCategories.find(c => c.id === bigCategoryId);
        return category?.name || '-';
      }
    },
    {
      title: '中分类',
      dataIndex: 'middleCategoryId',
      key: 'middleCategoryId',
      width: 120,
      render: (middleCategoryId: string) => {
        const category = middleCategories.find(c => c.id === middleCategoryId);
        return category?.name || '-';
      }
    },
    {
      title: '型号',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 120,
      render: (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model?.code || '-';
      }
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
          onChange={(value) => handlePriceTypeChange(record.key, value)}
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
      render: (price: number) => price
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record) => (
        <InputNumber
          value={quantity}
          style={{ width: '100%' }}
          min={1}
          onChange={(value) => handleQuantityChange(record.key, value)}
        />
      )
    },
    {
      title: '返利值',
      key: 'rebateValue',
      width: 120,
      render: (_, record) => {
        if (record.applicationTypeId === 'app-001') {
          // 单价申请显示返利单价输入框
          return (
            <InputNumber
              value={record.rebatePrice}
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              onChange={(value) => handleRebatePriceChange(record.key, value)}
              addonAfter="元"
            />
          );
        } else if (record.applicationTypeId === 'app-002') {
          // 返利率申请显示返利率输入框
          return (
            <InputNumber
              value={record.rebateRate}
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.01}
              precision={2}
              onChange={(value) => handleRebateRateChange(record.key, value)}
              addonAfter="%"
            />
          );
        }
        return '-';
      }
    },
    {
      title: '申请金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      width: 100,
      render: (rebateAmount: number) => (
        <span>{rebateAmount.toFixed(2)}</span>
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      width: 150,
      render: (comment: string, record) => (
        <Input
          value={comment}
          onChange={(e) => handleCommentChange(record.key, e.target.value)}
          placeholder="备注"
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
        !item.modelId || !item.priceTypeId || item.quantity <= 0 || 
        (item.applicationTypeId === 'app-001' && item.rebatePrice <= 0) ||
        (item.applicationTypeId === 'app-002' && item.rebateRate <= 0));
      
      if (invalidRow !== -1) {
        message.error(`第 ${invalidRow + 1} 行数据不完整，请检查必填项和数值`);
        return;
      }

      setSubmitLoading(true);
      
      // 提取所有明细项的型号ID
      const modelIds = tableData.map(item => item.modelId);
      
      // 使用第一个明细项的数据作为基础（除了modelIds）
      const firstItem = tableData[0];
      
      // 创建返利申请请求
      const createRequest: CreateRebateRequest = {
        corporationId: formValues.corporationId,
        categoryId: formValues.categoryId,
        salesDeptId: formValues.salesDeptId,
        budgetDeptId: formValues.budgetDeptId,
        bigCategoryId: firstItem.bigCategoryId,
        middleCategoryId: firstItem.middleCategoryId,
        modelIds: modelIds,
        periodStart: formValues.periodStart.format('YYYY-MM-DD'),
        periodEnd: formValues.periodEnd.format('YYYY-MM-DD'),
        priceTypeId: firstItem.priceTypeId,
        price: firstItem.price,
        quantity: firstItem.quantity,
        applicationTypeId: firstItem.applicationTypeId,
        rebatePrice: firstItem.applicationTypeId === 'app-001' ? firstItem.rebatePrice : undefined,
        rebateRate: firstItem.applicationTypeId === 'app-002' ? firstItem.rebateRate : undefined,
        title: formValues.title,
        description: formValues.description,
        comment: firstItem.comment
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

  // 处理表格中价格类型变更
  const handlePriceTypeChange = (key: string, value: string) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        return { ...item, priceTypeId: value };
      }
      return item;
    });
    setTableData(newData);
    setFormModified(true);
  };

  // 处理表格中数量变更
  const handleQuantityChange = (key: string, value: number | null) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        const quantity = value || 0;
        const newItem = { ...item, quantity };
        
        // 重新计算返利金额
        if (newItem.applicationTypeId === 'app-001') {
          newItem.rebateAmount = Math.round(newItem.rebatePrice * quantity * 100) / 100;
        } else if (newItem.applicationTypeId === 'app-002') {
          newItem.rebateAmount = Math.round(newItem.price * quantity * (newItem.rebateRate / 100) * 100) / 100;
        }
        
        return newItem;
      }
      return item;
    });
    
    setTableData(newData);
    setFormModified(true);
  };

  // 处理表格中返利单价变更
  const handleRebatePriceChange = (key: string, value: number | null) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        const rebatePrice = value || 0;
        const newItem = { ...item, rebatePrice };
        
        // 重新计算返利金额
        newItem.rebateAmount = Math.round(rebatePrice * item.quantity * 100) / 100;
        
        return newItem;
      }
      return item;
    });
    
    setTableData(newData);
    setFormModified(true);
  };

  // 处理表格中返利率变更
  const handleRebateRateChange = (key: string, value: number | null) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        const rebateRate = value || 0;
        const newItem = { ...item, rebateRate };
        
        // 重新计算返利金额
        newItem.rebateAmount = Math.round(item.price * item.quantity * (rebateRate / 100) * 100) / 100;
        
        return newItem;
      }
      return item;
    });
    
    setTableData(newData);
    setFormModified(true);
  };

  // 处理表格中备注变更
  const handleCommentChange = (key: string, value: string) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        return { ...item, comment: value };
      }
      return item;
    });
    
    setTableData(newData);
    setFormModified(true);
  };

  return (
    <div className="rebate-new-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F5F5', padding: '0 0 24px' }}>
      {/* 添加/编辑明细弹窗 */}
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
                    placeholder="选择大分类"
                    onChange={(value) => setSelectedBigCategoryId(value)}
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
                    placeholder="选择中分类"
                    disabled={!selectedBigCategoryId}
                    onChange={(value) => setSelectedMiddleCategoryId(value)}
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
                    placeholder="选择型号"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {models.filter(model => 
                      (!selectedCorporationId || model.corporationId === selectedCorporationId) &&
                      (!selectedBigCategoryId || model.bigCategoryId === selectedBigCategoryId) &&
                      (!selectedMiddleCategoryId || model.middleCategoryId === selectedMiddleCategoryId)
                    ).map(model => (
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
                    onChange={handleApplicationTypeChange}
                  >
                    {APPLICATION_TYPES.map(type => (
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
              {selectedItemType === 'app-001' && (
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
              {selectedItemType === 'app-002' && (
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
                  label="备注"
                >
                  <TextArea 
                    rows={2} 
                    placeholder="请输入备注"
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
            form={form}
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
