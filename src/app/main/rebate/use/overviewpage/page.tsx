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
  Table, 
  Tag, 
  Space, 
  Form,
  Divider,
  Tooltip,
  App
} from 'antd';
import { 
  SearchOutlined, 
  FileTextOutlined,
  ReloadOutlined,
  PlusOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import FadeIn from '@/components/transitions/FadeIn';
import type { ColumnsType } from 'antd/es/table';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { rebateService } from '@/services/rebateService';
import { 
  RebateRecordWithRelations, 
  RebateSearchParams, 
  RebateStatus,
  RebateStatusText,
  Corporation,
  Category,
  SalesDept,
  BudgetDept,
  PriceType,
  Model
} from '@/types/Rebate/rebate';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/hooks/useNavigation';

const { Title, Paragraph } = Typography;
const { Option, OptGroup } = Select;

// 主要组件
function RebateOverviewPage() {
  const { message } = App.useApp(); // 使用App.useApp获取上下文
  const { navigateTo, navigateWithConfirm } = useNavigation();
  const router = useRouter();

  // 实际查询参数 - 用于触发API查询
  const [searchParams, setSearchParams] = useState<RebateSearchParams>({
    applicationNumber: undefined,
    corporationId: undefined,
    categoryId: undefined,
    salesDeptId: undefined,
    budgetDeptId: undefined,
    modelIds: undefined,
    periodStart: undefined,
    periodEnd: undefined,
    status: undefined,
    applicantId: undefined,
    title: undefined,
    priceTypeId: undefined,
    sortBy: 'applicationNumber',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10
  });
  
  // 临时表单状态 - 用于存储用户输入
  const [formValues, setFormValues] = useState<RebateSearchParams>({
    applicationNumber: undefined,
    corporationId: undefined,
    categoryId: undefined,
    salesDeptId: undefined,
    budgetDeptId: undefined,
    modelIds: undefined,
    periodStart: undefined,
    periodEnd: undefined,
    status: undefined,
    applicantId: undefined,
    title: undefined,
    priceTypeId: undefined,
    sortBy: 'applicationNumber',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10
  });
  
  const [rebates, setRebates] = useState<RebateRecordWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({ 
    total: 0, 
    inReview: 0, 
    completed: 0, 
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0
  });
  
  // 下拉选项数据
  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesDepts, setSalesDepts] = useState<SalesDept[]>([]);
  const [budgetDepts, setBudgetDepts] = useState<BudgetDept[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  
  // 加载下拉选项数据
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [corporationsData, categoriesData, salesDeptsData, budgetDeptsData, priceTypesData, ModelsData] = 
          await Promise.all([
            rebateService.getCorporations(true),
            rebateService.getCategories(true),
            rebateService.getSalesDepts(true),
            rebateService.getBudgetDepts(true),
            rebateService.getPriceTypes(true),
            rebateService.getModels({isActive:true}) // 初始化获取所有的产品型号
          ]);
        
        setCorporations(corporationsData);
        setCategories(categoriesData);
        setSalesDepts(salesDeptsData);
        setBudgetDepts(budgetDeptsData);
        setPriceTypes(priceTypesData);
        setModels(ModelsData);
      } catch (error) {
        console.error('加载下拉选项数据失败:', error);
        message.error('加载下拉选项数据失败');
      }
    };
    
    loadLookupData();
  }, [message]);

  // 型号数据加载
  useEffect(() => { 
    const loadModelData = async () => { 
      try {
        const modelsData = await rebateService.getModels({
          corporationId: formValues.corporationId,
          isActive: true
        });
        setModels(modelsData);
      } catch (error) {
        console.error('加载型号数据失败:', error);
        message.error('加载型号数据失败');
      }
    }
    loadModelData();
  }, [formValues.corporationId, message]);
  
  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const statsData = await rebateService.getRebateStats();
        setStats(statsData);
      } catch (error) {
        console.error('加载统计数据失败:', error);
        message.error('加载统计数据失败');
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadStats();
  }, [message]);
  
  // 加载返利申请数据
  useEffect(() => {
    const loadRebates = async () => {
      setLoading(true);
      try {
        const result = await rebateService.getRebates(searchParams);
        setRebates(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('加载返利申请数据失败:', error);
        message.error('加载返利申请数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadRebates();
  }, [searchParams, message]);
  
  // 搜索处理 - 将表单值同步到搜索参数
  const handleSearch = () => {
    setSearchParams({ 
      ...formValues, 
      sortBy: 'applicationNumber',
      sortOrder: 'desc',
      page: 1 
    });
  };
  
  // 重置处理
  const handleReset = () => {
    const resetValues: RebateSearchParams = {
      applicationNumber: undefined,
      corporationId: undefined,
      categoryId: undefined,
      salesDeptId: undefined,
      budgetDeptId: undefined,
      periodStart: undefined,
      periodEnd: undefined,
      status: undefined,
      applicantId: undefined,
      title: undefined,
      priceTypeId: undefined,
      sortBy: 'applicationNumber',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10
    };
    
    setFormValues(resetValues);
    setSearchParams(resetValues);
  };
  
  // 刷新处理
  const handleRefresh = () => {
    const loadRebates = async () => {
      setLoading(true);
      try {
        const result = await rebateService.getRebates(searchParams);
        setRebates(result.data);
        setTotal(result.total);
        message.success('数据已刷新');
      } catch (error) {
        console.error('刷新数据失败:', error);
        message.error('刷新数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadRebates();
    
    // 同时刷新统计数据
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const statsData = await rebateService.getRebateStats();
        setStats(statsData);
      } catch (error) {
        console.error('刷新统计数据失败:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadStats();
  };
  
  // 分页处理
  const handlePaginationChange = (page: number, pageSize?: number) => {
    setSearchParams({ ...searchParams, page, pageSize: pageSize || 10 });
  };
  
  // 处理新建返利申请
  const handleNavigateToNewRebate = () => {
    navigateTo('/main/rebate/use/new', { 
      loadingMessage: '正在准备创建返利申请...',
      timeout: 1000 // 限制最大加载时间为1秒
    });
  };
  
  // 处理查看返利详情
  const handleNavigateToDetail = (id: string) => {
    navigateTo(`/main/rebate/use/detail/${id}`, { 
      loadingMessage: '正在加载返利详情...'
    });
  };
  
  // 表格列定义
  const columns: ColumnsType<RebateRecordWithRelations> = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 40,
      fixed: 'left',
      render: () => <input type="checkbox" />
    },
    {
      title: '申请编号',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      width: 100,
      ellipsis: { showTitle: false },
      render: (text: string, record) => (
        <Tooltip placement="topLeft" title={text}>
          <a onClick={() => handleNavigateToDetail(record.id)} style={{ color: '#1677ff', cursor: 'pointer' }}>{text}</a>
        </Tooltip >
      ),
    },
    {
      title: '法人',
      dataIndex: ['corporation', 'name'],
      key: 'corporation',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '返利区分',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '销售区分',
      dataIndex: ['salesDept', 'name'],
      key: 'salesDept',
      width: 120,
      ellipsis: false,
      render: (text: string) => {
        // 使用与状态标签不同的颜色体系 - 使用更柔和的颜色
        const colorMap: Record<string, string> = {
          '国内': '#13c2c2',
          '国外': '#722ed1',
          '直销': '#eb2f96',
          '电商': '#2f54eb',
          '批发': '#fa8c16',
          '代理': '#1890ff',
          '渠道': '#faad14',
          '零售': '#52c41a'
        };
        
        // 为未定义的值使用固定的颜色数组，确保颜色区分度
        const colorArray = ['#13c2c2', '#722ed1', '#2f54eb', '#eb2f96', '#fa541c', '#fadb14', '#a0d911', '#1890ff'];
        const color = colorMap[text] || colorArray[text.length % colorArray.length];
        
        return <Tag color={color} style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</Tag>;
      }
    },
    {
      title: '预算分类',
      dataIndex: ['budgetDept', 'name'],
      key: 'budgetDept',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '大分类',
      dataIndex: ['bigCategory', 'name'],
      key: 'bigCategory',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '中分类',
      dataIndex: ['middleCategory', 'name'],
      key: 'middleCategory',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '型号',
      dataIndex: ['models'],
      key: 'models',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (models) => {
        if (!models || models.length === 0) return '-';
        const text = models.map((model: { code: string }) => model.code).join(';');
        return (
          <Tooltip placement="topLeft" title={text}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {text}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: '返利期间',
      key: 'period',
      width: 180,
      ellipsis: false,
      render: (_, record) => {
        const startDate = record.periodStart ? dayjs(record.periodStart).format('YYYY/MM/DD') : 'N/A';
        const endDate = record.periodEnd ? dayjs(record.periodEnd).format('YYYY/MM/DD') : 'N/A';
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {startDate}-{endDate}
          </div>
        );
      },
    },
    {
      title: '价格类型',
      dataIndex: ['priceType', 'name'],
      key: 'priceType',
      width: 140,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string, record) => (
        <Tooltip placement="topLeft" title={`${text}是指${record.priceType?.description || '当前产品的价格类型'}`}>
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text} 
            <InfoCircleOutlined style={{ marginLeft: 4, color: '#1677ff', fontSize: 12, cursor: 'pointer', flexShrink: 0 }} />
          </div>
        </Tooltip>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '返利值',
      key: 'rebateValue',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        // 根据申请类型ID判断显示返利单价还是返利率
        if (record.applicationType?.id === 'app-001') { // 单价申请
          return (
            <Tooltip placement="topLeft" title={`${record.rebatePrice || 0}(元)`}>
              {`${record.rebatePrice || 0}(元)`}
            </Tooltip>
          );
        } else if (record.applicationType?.id === 'app-002') { // 返利率申请
          // 返利率通常以百分比形式显示
          const rateValue = record.rebateRate ? (record.rebateRate / 100) : 0;
          return (
            <Tooltip placement="topLeft" title={`${rateValue}%`}>
              {`${rateValue}(%)`}
            </Tooltip>
          );
        }
        return '-'; // 默认显示
      },
    },
    {
      title: '申请金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: '备注',
      key: 'comment',
      width: 60,
      render: (_, record) => record.comment ? (
        <Tooltip title={record.comment}>
          <FileTextOutlined style={{ color: '#1677ff', cursor: 'pointer' }} />
        </Tooltip>
      ) : null
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      ellipsis: false,
      render: (status: RebateStatus) => {
        const colorMap: Record<RebateStatus, string> = {
          [RebateStatus.DRAFT]: 'default',
          [RebateStatus.PENDING]: 'orange',
          [RebateStatus.IN_REVIEW]: 'processing',
          [RebateStatus.APPROVED]: 'success',
          [RebateStatus.REJECTED]: 'error',
          [RebateStatus.COMPLETED]: 'success'
        };
        return <Tag color={colorMap[status]} style={{ whiteSpace: 'nowrap' }}>{RebateStatusText[status]}</Tag>;
      }
    },
  ];

  // 创建响应式列配置
  const getResponsiveColumns = () => {
    // 获取窗口宽度
    if (typeof window !== 'undefined') {
      const windowWidth = window.innerWidth;
      
      // 根据窗口宽度返回不同的列配置
      if (windowWidth < 1200) {
        // 移除部分次要列，保留重要列
        return columns.filter(col => 
          col.key !== 'price' && 
          col.key !== 'quantity' && 
          col.key !== 'rebateAmount' && 
          col.key !== 'applicationType'
        );
      }
    }
    
    return columns;
  };

  // 使用状态保存响应式列
  const [responsiveColumns, setResponsiveColumns] = useState(columns);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setResponsiveColumns(getResponsiveColumns());
    };

    // 初始设置
    handleResize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="rebate-overview-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F5F5F5', padding: '0 0 24px' }}>
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
            <Title level={2} style={{ margin: 0 }}>返利申请一览</Title>
            <Paragraph style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              查看和管理所有返利申请记录
            </Paragraph>
          </div>
          <Space>
            <Button 
              icon={<ExportOutlined />} 
              style={{ 
                borderRadius: 8,
                background: 'white',
                borderColor: '#d9d9d9',
                boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
              }}
            >
              导出数据
            </Button>
          </Space>
        </div>
      </FadeIn>

      {/* 搜索筛选区 */}
      <FadeIn delay={0.1}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FilterOutlined style={{ color: '#1677ff', marginRight: 8 }} />
              <span>搜索筛选</span>
            </div>
          }
          variant="borderless"
          style={{ 
            marginBottom: 24, 
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f6f8ff 100%)'
          }}
          styles={{ body: { padding: '20px 24px 16px' } }}
        >
          <Form layout="vertical" style={{ marginBottom: '-8px' }}>
            <Row gutter={[20, 0]}>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="申请编号"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择申请编号"
                    value={formValues.applicationNumber}
                    onChange={(value) => setFormValues({ ...formValues, applicationNumber: value })}
                    allowClear
                    showSearch
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                    style={{ borderRadius: 8 }}
                  >
                    {rebates.map((rebate) => (
                      <Option key={rebate.applicationNumber} value={rebate.applicationNumber}>
                        {rebate.applicationNumber}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="返利区分"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择区分"
                    value={formValues.categoryId}
                    onChange={(value) => setFormValues({ ...formValues, categoryId: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="销售区分"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择销售区分"
                    value={formValues.salesDeptId}
                    onChange={(value) => setFormValues({ ...formValues, salesDeptId: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {salesDepts.map((dept) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="预算分类"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择预算分类"
                    value={formValues.budgetDeptId}
                    onChange={(value) => setFormValues({ ...formValues, budgetDeptId: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {budgetDepts.map((dept) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="法人"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择法人"
                    value={formValues.corporationId}
                    onChange={(value) => setFormValues({ ...formValues, corporationId: value })}
                    showSearch
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {corporations.map((corp) => (
                      <Option key={corp.id} value={corp.id}>
                        {corp.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="型号"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择型号"
                    value={formValues.modelIds}
                    onChange={(value) => setFormValues({ ...formValues, modelIds: value })}
                    mode="multiple"
                    showSearch
                    allowClear
                    maxTagCount={0}
                    maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}个型号`}
                    optionFilterProp="children"
                    virtual={true}
                    listHeight={300}
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {models.map((model) => (
                      <Option key={model.id} value={model.id}>
                        {model.code}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="返利开始日期"
                  style={{ marginBottom: 12 }}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    locale={locale}
                    value={formValues.periodStart ? dayjs(formValues.periodStart) : null}
                    onChange={(date) => {
                      setFormValues({ 
                        ...formValues, 
                        periodStart: date ? date.format('YYYY-MM-DD') : undefined
                      });
                    }}
                    placeholder="开始日期"
                  />
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="返利结束日期"
                  style={{ marginBottom: 12 }}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    locale={locale}
                    value={formValues.periodEnd ? dayjs(formValues.periodEnd) : null}
                    onChange={(date) => {
                      setFormValues({ 
                        ...formValues, 
                        periodEnd: date ? date.format('YYYY-MM-DD') : undefined
                      });
                    }}
                    placeholder="结束日期"
                  />
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="申请人"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择申请人"
                    value={formValues.applicantId}
                    onChange={(value) => setFormValues({ ...formValues, applicantId: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    <Option value="user-001">HJS SFA Admin</Option>
                    <Option value="user-002">张三</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="标题"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择标题"
                    value={formValues.title}
                    onChange={(value) => setFormValues({ ...formValues, title: value })}
                    showSearch
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {rebates.map((rebate) => (
                      <Option key={rebate.id} value={rebate.title}>
                        {rebate.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="状态"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择状态"
                    value={formValues.status}
                    onChange={(value) => setFormValues({ ...formValues, status: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {Object.entries(RebateStatusText).map(([status, text]) => (
                      <Option key={status} value={status}>
                        {text}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8} lg={6} xl={4}>
                <Form.Item
                  label="价格类型"
                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="选择价格类型"
                    value={formValues.priceTypeId}
                    onChange={(value) => setFormValues({ ...formValues, priceTypeId: value })}
                    allowClear
                    suffixIcon={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
                  >
                    {priceTypes.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Space style={{ marginBottom: 12 }}>
                  <Button 
                    onClick={handleReset}
                    style={{ 
                      borderRadius: 8,
                      background: 'white',
                      borderColor: '#d9d9d9',
                      boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    清空
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={handleSearch}
                    style={{ 
                      borderRadius: 8,
                      background: 'linear-gradient(90deg, #1677ff 0%, #1890ff 100%)',
                      border: 'none',
                      boxShadow: '0 2px 0 rgba(5, 125, 255, 0.1)'
                    }}
                  >
                    搜索
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </FadeIn>

      {/* 数据卡片概览 */}
      <FadeIn delay={0.15}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card 
              variant="borderless"
              style={{ 
                background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', 
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
              styles={{ body: { padding: 24 } }}
              loading={statsLoading}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                  <AppstoreOutlined style={{ fontSize: 80 }} />
                </div>
                <div style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: 8 }}>申请总数</div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.total}</span>
                  <Tag color="blue" style={{ marginLeft: 8 }}>本月</Tag>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              variant="borderless"
              style={{ 
                background: 'linear-gradient(135deg, #b64aff 0%, #e4b1fe 100%)', 
                color: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
              styles={{ body: { padding: 24 } }}
              loading={statsLoading}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                  <SearchOutlined style={{ fontSize: 80 }} />
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>审核中</div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.inReview}</span>
                  <Tag style={{ marginLeft: 8, background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white' }}>
                    {stats.total > 0 ? Math.round((stats.inReview / stats.total) * 100) : 0}%
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              variant="borderless"
              style={{ 
                background: 'linear-gradient(135deg, #0d1d34 0%, #1a2a42 100%)', 
                color: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
              loading={statsLoading}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                  <FileTextOutlined style={{ fontSize: 80 }} />
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>已完成</div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.completed}</span>
                  <Tag style={{ marginLeft: 8, background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white' }}>
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </FadeIn>

      {/* 数据表格区域 */}
      <FadeIn delay={0.2}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>申请记录</span>
              <Divider type="vertical" style={{ margin: '0 12px', height: 14 }} />
              <span style={{ fontWeight: 'normal', fontSize: 14, color: '#8c8c8c' }}>共 {total} 条记录</span>
            </div>
          }
          variant="borderless"
          style={{ 
            borderRadius: 12, 
            flex: 1,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02)',
            background: 'white'
          }}
          extra={
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                style={{ 
                  borderRadius: 8,
                  background: 'white',
                  borderColor: '#d9d9d9',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                }}
              >
                刷新
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleNavigateToNewRebate}
                style={{ 
                  borderRadius: 8,
                  background: 'linear-gradient(90deg, #1677ff 0%, #1890ff 100%)',
                  border: 'none',
                  boxShadow: '0 2px 0 rgba(5, 125, 255, 0.1)'
                }}
              >
                新建申请
              </Button>
            </Space>
          }
        >
          <Table 
            dataSource={rebates}
            columns={responsiveColumns}
            loading={loading}
            sortDirections = {['ascend', 'descend']}
            pagination={{ 
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSize: searchParams.pageSize || 10,
              current: searchParams.page || 1,
              total: total,
              onChange: handlePaginationChange,
              onShowSizeChange: (_, size) => {
                setSearchParams({ ...searchParams, pageSize: size });
              }
            }}
            rowKey="id"
            size="middle"
            style={{ marginTop: 8 }}
            rowClassName={() => 'ant-table-row-custom'}
          />
          <style jsx global>{`
            .ant-table {
              width: 100%;
              table-layout: fixed !important;
            }
            
            .ant-table-container {
              width: 100%;
              overflow-x: auto !important; /* 当内容超出时出现滚动条 */
            }
            
            .ant-table-body {
              overflow-x: auto !important; /* 当内容超出时出现滚动条 */
            }

            @media (max-width: 768px) {
              .ant-table-container {
                overflow-x: auto !important;
              }
            }
            
            .ant-table-row-custom:hover > td {
              background-color: #f5f8ff !important;
            }
            .ant-select-selector {
              border-radius: 6px !important;
            }
            .ant-btn:not(.sidebar-collapse-button):hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .ant-table-thead > tr > th {
              background-color: #f0f5ff !important;
              font-weight: 500;
              color: #262626;
              border-bottom: 1px solid #e6f0ff;
            }
            .ant-pagination-item-active {
              border-color: #1677ff;
              background: #f0f5ff;
            }
            .ant-pagination-item-active a {
              color: #1677ff;
            }
            .dashboard-container .ant-card {
              transition: all 0.3s;
            }
            .dashboard-container .ant-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            }
          `}</style>
        </Card>
      </FadeIn>
    </div>
  );
}

// 导出包装版本，确保提供App上下文
export default function RebateOverviewWithAppContext() {
  return (
    <App>
      <RebateOverviewPage />
    </App>
  );
}
