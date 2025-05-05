/**
 * 模拟数据库服务
 * 用于在浏览器环境中模拟简单的数据库操作
 */

import corporations from './data/corporations.json';
import categories from './data/categories.json';
import salesDepts from './data/salesDepts.json';
import budgetDepts from './data/budgetDepts.json';
import priceTypes from './data/priceTypes.json';
import rebates from './data/rebates.json';
import model from './data/model.json';
import { 
  Corporation, 
  Category, 
  SalesDept, 
  BudgetDept, 
  PriceType, 
  RebateRecord,
  RebateRecordWithRelations,
  PaginatedResult,
  RebateSearchParams,
  RebateStatus,
  RebateStats,
  Model
} from '@/types/rebate';

// 内存数据库
class MockDatabase {
  private corporations: Corporation[] = [];
  private categories: Category[] = [];
  private salesDepts: SalesDept[] = [];
  private budgetDepts: BudgetDept[] = [];
  private priceTypes: PriceType[] = [];
  private rebates: RebateRecord[] = [];
  private models: Model[] = [];

  constructor() {
    this.init();
  }

  // 初始化数据
  private init() {
    this.corporations = corporations as Corporation[];
    this.categories = categories as Category[];
    this.salesDepts = salesDepts as SalesDept[];
    this.budgetDepts = budgetDepts as BudgetDept[];
    this.priceTypes = priceTypes as PriceType[];
    this.rebates = rebates as RebateRecord[];
    this.models = model as Model[];
  }

  // 基础查询方法
  getCorporations(isActive?: boolean): Corporation[] {
    if (isActive !== undefined) {
      return this.corporations.filter(corp => corp.isActive === isActive);
    }
    return this.corporations;
  }

  getCategories(isActive?: boolean): Category[] {
    if (isActive !== undefined) {
      return this.categories.filter(cat => cat.isActive === isActive);
    }
    return this.categories;
  }

  getSalesDepts(isActive?: boolean): SalesDept[] {
    if (isActive !== undefined) {
      return this.salesDepts.filter(dept => dept.isActive === isActive);
    }
    return this.salesDepts;
  }

  getBudgetDepts(isActive?: boolean): BudgetDept[] {
    if (isActive !== undefined) {
      return this.budgetDepts.filter(dept => dept.isActive === isActive);
    }
    return this.budgetDepts;
  }

  getPriceTypes(isActive?: boolean): PriceType[] {
    if (isActive !== undefined) {
      return this.priceTypes.filter(type => type.isActive === isActive);
    }
    return this.priceTypes;
  }

  getModels(param: { corporationId?: string; isActive?: boolean }): Model[] {
    let filteredModels = this.models;

    if (param.corporationId) {
      filteredModels = filteredModels.filter(m => m.corporationId === param.corporationId);
    }

    if (typeof param.isActive === 'boolean') {
      filteredModels = filteredModels.filter(m => m.isActive === param.isActive);
    }
    return filteredModels;
  }

  // 根据ID查找实体
  getCorporationById(id: string): Corporation | undefined {
    return this.corporations.find(corp => corp.id === id);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  getSalesDeptById(id: string): SalesDept | undefined {
    return this.salesDepts.find(dept => dept.id === id);
  }

  getBudgetDeptById(id: string): BudgetDept | undefined {
    return this.budgetDepts.find(dept => dept.id === id);
  }

  getPriceTypeById(id: string): PriceType | undefined {
    return this.priceTypes.find(type => type.id === id);
  }

  // 根据型号ID查找所有的产品型号详细数据
  getModelByIds(ids: string[]): Model[]{
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.models.filter(model => ids.includes(model.id));
  }

  // 返利申请查询方法
  getRebateById(id: string): RebateRecord | undefined {
    return this.rebates.find(rebate => rebate.id === id);
  }

  getRebateWithRelationsById(id: string): RebateRecordWithRelations | undefined {
    const rebate = this.getRebateById(id);
    if (!rebate) return undefined;

    const corporation = this.getCorporationById(rebate.corporationId);
    const category = this.getCategoryById(rebate.categoryId);
    const salesDept = this.getSalesDeptById(rebate.salesDeptId);
    const budgetDept = this.getBudgetDeptById(rebate.budgetDeptId);
    const priceType = this.getPriceTypeById(rebate.priceTypeId);
    const models = this.getModelByIds(rebate.modelIds);

    if (!corporation || !category || !salesDept || !budgetDept || !priceType) {
      return undefined;
    }

    return {
      ...rebate,
      corporation,
      category,
      salesDept,
      budgetDept,
      priceType,
      models
    };
  }

  // 分页查询返利申请列表
  searchRebates(params: RebateSearchParams): PaginatedResult<RebateRecordWithRelations> {
    let filteredRebates = this.rebates.slice();

    // 应用过滤条件
    if (params.applicationNumber) {
      filteredRebates = filteredRebates.filter(r => 
        r.applicationNumber.includes(params.applicationNumber!)
      );
    }

    if (params.corporationId) {
      filteredRebates = filteredRebates.filter(r => r.corporationId === params.corporationId);
    }
    
    if (params.categoryId) {
      filteredRebates = filteredRebates.filter(r => r.categoryId === params.categoryId);
    }
    
    if (params.salesDeptId) {
      filteredRebates = filteredRebates.filter(r => r.salesDeptId === params.salesDeptId);
    }
    
    if (params.budgetDeptId) {
      filteredRebates = filteredRebates.filter(r => r.budgetDeptId === params.budgetDeptId);
    }
    
    if (params.periodStart && params.periodEnd) {
      filteredRebates = filteredRebates.filter(r => {
        const periodStartMatch = new Date(r.periodStart) >= new Date(params.periodStart!);
        const periodEndMatch = new Date(r.periodEnd) <= new Date(params.periodEnd!);
        return periodStartMatch && periodEndMatch;
      });
    } else if (params.periodStart) {
      filteredRebates = filteredRebates.filter(r => 
        new Date(r.periodStart) >= new Date(params.periodStart!)
      );
    } else if (params.periodEnd) {
      filteredRebates = filteredRebates.filter(r => 
        new Date(r.periodEnd) <= new Date(params.periodEnd!)
      );
    }
    
    if (params.status) {
      filteredRebates = filteredRebates.filter(r => r.status === params.status);
    }
    
    if (params.applicantId) {
      filteredRebates = filteredRebates.filter(r => r.applicantId === params.applicantId);
    }
    
    if (params.title) {
      filteredRebates = filteredRebates.filter(r => 
        r.title.includes(params.title!)
      );
    }
    
    if (params.priceTypeId) {
      filteredRebates = filteredRebates.filter(r => r.priceTypeId === params.priceTypeId);
    }

    if (params.modelIds && Array.isArray(params.modelIds) && params.modelIds.length > 0) {
      const currentModelIds = params.modelIds;
      filteredRebates = filteredRebates.filter(r => 
        currentModelIds.some(modelId => r.modelIds.includes(modelId))
      );
    }

    // 计算分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const total = filteredRebates.length;
    const totalPages = Math.ceil(total / pageSize);

    // 切片并添加关联数据
    const paginatedRebates = filteredRebates
      .slice(startIndex, endIndex)
      .map(rebate => {
        const corporation = this.getCorporationById(rebate.corporationId)!;
        const category = this.getCategoryById(rebate.categoryId)!;
        const salesDept = this.getSalesDeptById(rebate.salesDeptId)!;
        const budgetDept = this.getBudgetDeptById(rebate.budgetDeptId)!;
        const priceType = this.getPriceTypeById(rebate.priceTypeId)!;
        const models = this.getModelByIds(rebate.modelIds);

        return {
          ...rebate,
          corporation,
          category,
          salesDept,
          budgetDept,
          priceType,
          models
        };
      });

    return {
      data: paginatedRebates,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  // 创建返利申请
  createRebate(rebate: Partial<RebateRecord>): RebateRecord {
    // 生成ID和申请编号
    const newId = `rebate-${String(this.rebates.length + 1).padStart(3, '0')}`;
    const lastApplicationNumber = this.rebates
      .map(r => r.applicationNumber)
      .sort((a, b) => b.localeCompare(a))[0] || 'L202504000';
    
    const applicationNumberParts = lastApplicationNumber.match(/L(\d+)(\d{3})$/);
    let newApplicationNumber = 'L202504001';
    
    if (applicationNumberParts) {
      const prefix = applicationNumberParts[1];
      const sequence = parseInt(applicationNumberParts[2]) + 1;
      newApplicationNumber = `L${prefix}${String(sequence).padStart(3, '0')}`;
    }

    const now = new Date().toISOString();
    
    const newRebate: RebateRecord = {
      id: newId,
      applicationNumber: newApplicationNumber,
      corporationId: rebate.corporationId || '',
      categoryId: rebate.categoryId || '',
      salesDeptId: rebate.salesDeptId || '',
      budgetDeptId: rebate.budgetDeptId || '', 
      modelIds: rebate.modelIds || [],
      modelNames: rebate.modelNames || '',
      periodStart: rebate.periodStart || '',
      periodEnd: rebate.periodEnd || '',
      status: rebate.status || RebateStatus.DRAFT,
      range: rebate.range || 'All',
      priceTypeId: rebate.priceTypeId || '',
      price: rebate.price || 0,
      quantity: rebate.quantity || 0,
      applicationType: rebate.applicationType || '申请单价',
      rebatePrice: rebate.rebatePrice || 0,
      rebateAmount: rebate.rebateAmount || 0,
      title: rebate.title || '',
      description: rebate.description || '',
      comment: rebate.comment || '',
      applicantId: rebate.applicantId || 'user-001',
      applicantName: rebate.applicantName || 'HJS SFA Admin',
      createdAt: now,
      updatedAt: now
    };

    this.rebates.push(newRebate);
    return newRebate;
  }

  // 更新返利申请
  updateRebate(id: string, updates: Partial<RebateRecord>): RebateRecord | undefined {
    const index = this.rebates.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    const rebate = this.rebates[index];
    const updatedRebate = {
      ...rebate,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.rebates[index] = updatedRebate;
    return updatedRebate;
  }

  // 删除返利申请
  deleteRebate(id: string): boolean {
    const index = this.rebates.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.rebates.splice(index, 1);
    return true;
  }

  // 获取统计数据
  getRebateStats() {
    const total = this.rebates.length;
    const inReview = this.rebates.filter(r => r.status === RebateStatus.IN_REVIEW).length;
    const completed = this.rebates.filter(r => r.status === RebateStatus.COMPLETED).length;
    const pending = this.rebates.filter(r => r.status === RebateStatus.PENDING).length;
    const approved = this.rebates.filter(r => r.status === RebateStatus.APPROVED).length;
    const rejected = this.rebates.filter(r => r.status === RebateStatus.REJECTED).length;
    const draft = this.rebates.filter(r => r.status === RebateStatus.DRAFT).length;

    return {
      total,
      inReview,
      completed,
      pending,
      approved,
      rejected,
      draft
    };
  }
}

// 导出单例实例
export const db = new MockDatabase(); 