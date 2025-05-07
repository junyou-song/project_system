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
import applicationTypes from './data/applicationTypes.json';
import bigCategories from './data/bigCategories.json';
import middleCategories from './data/middleCategories.json';
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
  Model,
  ApplicationType,
  BigCategory,
  MiddleCategory
} from '@/types/Rebate/rebate';

// 内存数据库
class MockDatabase {
  private corporations: Corporation[] = [];
  private categories: Category[] = [];
  private salesDepts: SalesDept[] = [];
  private budgetDepts: BudgetDept[] = [];
  private priceTypes: PriceType[] = [];
  private rebates: RebateRecord[] = [];
  private applicationTypes: ApplicationType[] = [];
  private bigCategories: BigCategory[] = [];
  private middleCategories: MiddleCategory[] = [];
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
    this.applicationTypes = applicationTypes as ApplicationType[];
    this.bigCategories = bigCategories as BigCategory[];
    this.middleCategories = middleCategories as MiddleCategory[];
    this.rebates = rebates as RebateRecord[];
    this.models = model as Model[];
  }


  /**
   * 根据返利记录数据和申请类型计算返利金额。
   * @param rebateData 包含计算所需字段的部分或完整的返利记录对象。
   * @returns 计算得到的返利金额 (number)，如果无法计算则返回 0。
   * @private
   */
   private _calculateRebateAmount(rebateData: Partial<RebateRecord>): number {
    let calculatedAmount = 0;

    // 基础检查
    if (!rebateData || !rebateData.applicationTypeId || typeof rebateData.quantity !== 'number') {
      console.warn("无法计算返利金额：缺少 applicationTypeId 或 quantity 无效。");
      return calculatedAmount; // 返回 0
    }

    // 查找申请类型以确定计算方法
    const appType = this.getApplicationTypeById(rebateData.applicationTypeId);
    if (!appType || !appType.id) {
        console.warn(`无法计算返利金额：未找到 ID 为 ${rebateData.applicationTypeId} 的申请类型或其缺少 calculationMethod。`);
        return calculatedAmount; // 返回 0
    }

    // 根据计算方法执行计算
    switch (appType.id) {
      case 'app-001': // 按返利单价计算
        if (typeof rebateData.rebatePrice === 'number') {
          calculatedAmount = rebateData.rebatePrice * rebateData.quantity;
        } else {
          console.warn(`单价。计算跳过：rebatePrice 无效或缺失 (ID: ${rebateData.id || 'N/A'})。`);
        }
        break;

      case 'app-002': // 按返利率计算
        if (typeof rebateData.price === 'number' && typeof rebateData.rebateRate === 'number') {
          calculatedAmount = rebateData.price * rebateData.quantity * rebateData.rebateRate;
        } else {
          console.warn(`率。计算跳过：price 或 rebateRate 无效或缺失 (ID: ${rebateData.id || 'N/A'})。`);
        }
        break;

      default:
        console.warn(`未知的申请类型: ${appType.name} (申请类型 ID: ${appType.id})。`);
        break;
    }

    // 返回计算结果，确保是数字且有效（例如，非 NaN）
    return isNaN(calculatedAmount) ? 0 : calculatedAmount;
  }
  // --- 计算方法结束 ---


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

  getApplicationTypes(isActive?: boolean): ApplicationType[] {
    if (isActive !== undefined) {
      return this.applicationTypes.filter(type => type.isActive === isActive);
    }
    return this.applicationTypes;
  }

  getBigCategories(param: { corporationId?: string; isActive?: boolean }): BigCategory[] {
    let filteredBigCategories = this.bigCategories;

    if (param.corporationId) {
      filteredBigCategories = filteredBigCategories.filter(m => m.corporationId === param.corporationId);
    }

    if (typeof param.isActive === 'boolean') {
      filteredBigCategories = filteredBigCategories.filter(m => m.isActive === param.isActive);
    }
    return filteredBigCategories;
  }

  getMiddleCategories(param: { bigCategoryId?: string; isActive?: boolean }): MiddleCategory[] {
    let filteredMiddleCategories = this.middleCategories;

    if (param.bigCategoryId) {
      filteredMiddleCategories = filteredMiddleCategories.filter(m => m.bigCategoryId === param.bigCategoryId);
    }

    if (typeof param.isActive === 'boolean') {
      filteredMiddleCategories = filteredMiddleCategories.filter(m => m.isActive === param.isActive);
    }
    return filteredMiddleCategories;
  }

  getModels(param: { 
    corporationId?: string; 
    bigCategoryId?: string;
    middleCategoryId?: string;
    isActive?: boolean 
  }): Model[] {
    let filteredModels = this.models;

    if (param.corporationId) {
      filteredModels = filteredModels.filter(m => m.corporationId === param.corporationId);
    }

    if (param.bigCategoryId) {
      filteredModels = filteredModels.filter(m => m.bigCategoryId === param.bigCategoryId);
    }

    if (param.middleCategoryId) {
      filteredModels = filteredModels.filter(m => m.middleCategoryId === param.middleCategoryId);
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

  getApplicationTypeById(id: string): ApplicationType | undefined {
    return this.applicationTypes.find(type => type.id === id);
  }

  getBigCategoryById(id: string): BigCategory | undefined {
    return this.bigCategories.find(cat => cat.id === id);
  }

  getMiddleCategoryById(id: string): MiddleCategory | undefined {
    return this.middleCategories.find(cat => cat.id === id);
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
    const bigCategory = this.getBigCategoryById(rebate.bigCategoryId);
    const middleCategory = this.getMiddleCategoryById(rebate.middleCategoryId);
    const models = this.getModelByIds(rebate.modelIds);
    const applicationType = this.getApplicationTypeById(rebate.applicationTypeId);

    if (!corporation || !category || !salesDept || !budgetDept || !priceType || 
        !bigCategory || !middleCategory || !applicationType) {
      return undefined;
    }

    return {
      ...rebate,
      corporation,
      category,
      salesDept,
      budgetDept,
      priceType,
      bigCategory,
      middleCategory,
      applicationType,
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

    if (params.applicationTypeId) {
      filteredRebates = filteredRebates.filter(r => r.applicationTypeId === params.applicationTypeId);
    }

    if (params.bigCategoryId) {
      filteredRebates = filteredRebates.filter(r => r.bigCategoryId === params.bigCategoryId);
    }

    if (params.middleCategoryId) {
      filteredRebates = filteredRebates.filter(r => r.middleCategoryId === params.middleCategoryId);
    }

    if (params.modelIds && Array.isArray(params.modelIds) && params.modelIds.length > 0) {
      const currentModelIds = params.modelIds;
      filteredRebates = filteredRebates.filter(r => 
        currentModelIds.some(modelId => r.modelIds.includes(modelId))
      );
    }

    // 在此处添加排序逻辑
    if (params.sortBy && params.sortOrder) {
      filteredRebates.sort((a, b) => {
        const valA = a[params.sortBy as keyof RebateRecord];
        const valB = b[params.sortBy as keyof RebateRecord];

        if (valA === undefined || valB === undefined) return 0; // 或者根据需要处理 undefined

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }
        // 可以根据需要添加对其他类型的处理，例如日期

        return params.sortOrder === 'desc' ? comparison * -1 : comparison;
      });
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
        const corporation = this.getCorporationById(rebate.corporationId);
        const category = this.getCategoryById(rebate.categoryId);
        const salesDept = this.getSalesDeptById(rebate.salesDeptId);
        const budgetDept = this.getBudgetDeptById(rebate.budgetDeptId);
        const priceType = this.getPriceTypeById(rebate.priceTypeId);
        const bigCategory = this.getBigCategoryById(rebate.bigCategoryId);
        const middleCategory = this.getMiddleCategoryById(rebate.middleCategoryId);
        const models = this.getModelByIds(rebate.modelIds);
        const applicationType = this.getApplicationTypeById(rebate.applicationTypeId);

        // 新增校验：检查 models 数组是否成功加载了所有请求的模型
        if (models.length !== rebate.modelIds.length) {
          const missingModelIds = rebate.modelIds.filter(id => !models.find(m => m.id === id));
          console.warn(`ID 为 ${rebate.id} 的返利记录的部分 modelIds 在数据库中未找到。预期 ${rebate.modelIds.length} 个，实际找到 ${models.length} 个。缺失的 Model IDs: ${missingModelIds.join(', ')}`);
          // 注意：如果模型不完整则跳过该条返利记录，可以取消下面一行的注释
          // return null;
        }

        if (!corporation || !category || !salesDept || !budgetDept || !priceType || !bigCategory || !middleCategory || !applicationType ) {

        console.warn(`ID 为 ${rebate.id} 的返利记录缺少部分关联数据，将在结果中被跳过。`);
        
        // 决定如何处理：返回 null 以便后续过滤掉
        return null; 
        }

        return {
          ...rebate,
          corporation,
          category,
          salesDept,
          budgetDept,
          priceType,
          bigCategory,
          middleCategory,
          applicationType,
          models
        } as RebateRecordWithRelations;
      });

    return {
      data: paginatedRebates.filter(rebate => rebate !== null) as RebateRecordWithRelations[],
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
    
    const newRebateBase: RebateRecord = {
      id: newId,
      applicationNumber: newApplicationNumber,
      corporationId: rebate.corporationId || '',
      categoryId: rebate.categoryId || '',
      salesDeptId: rebate.salesDeptId || '',
      budgetDeptId: rebate.budgetDeptId || '', 
      applicationTypeId: rebate.applicationTypeId || '',
      bigCategoryId: rebate.bigCategoryId || '',
      middleCategoryId: rebate.middleCategoryId || '',
      modelIds: rebate.modelIds || [],
      modelNames: rebate.modelNames || '',
      periodStart: rebate.periodStart || '',
      periodEnd: rebate.periodEnd || '',
      status: rebate.status || RebateStatus.DRAFT,
      priceTypeId: rebate.priceTypeId || '',
      price: rebate.price || 0,
      quantity: rebate.quantity || 0,
      rebatePrice: rebate.rebatePrice,
      rebateRate: rebate.rebateRate,
      rebateAmount: 0,
      title: rebate.title || '',
      description: rebate.description || '',
      comment: rebate.comment || '',
      applicantId: rebate.applicantId || 'user-001',
      applicantName: rebate.applicantName || 'HJS SFA Admin',
      createdAt: now,
      updatedAt: now
    };

    const calculatedAmount = this._calculateRebateAmount(newRebateBase);

    const newRebate = {
      ...newRebateBase,
      rebateAmount: calculatedAmount
    }

    this.rebates.push(newRebate);
    return newRebate;
  }

  // 更新返利申请
  updateRebate(id: string, updates: Partial<RebateRecord>): RebateRecord | undefined {
    const index = this.rebates.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    const rebate = this.rebates[index];
    const potentiallyUpdatedRebate  = {
      ...rebate,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const calculatedAmount = this._calculateRebateAmount(potentiallyUpdatedRebate);

    const updatedRebate: RebateRecord = {
      ...potentiallyUpdatedRebate,
      rebateAmount: calculatedAmount // 使用重新计算的金额
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