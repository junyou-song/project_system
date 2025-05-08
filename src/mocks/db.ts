/**
 * 模拟数据库服务
 * 用于在浏览器环境中模拟简单的数据库操作，支持返利申请主从表结构。
 */

import corporations from './data/corporations.json';
import categories from './data/categories.json';
import salesDepts from './data/salesDepts.json';
import budgetDepts from './data/budgetDepts.json';
import priceTypes from './data/priceTypes.json';
import applicationTypes from './data/applicationTypes.json';
import bigCategories from './data/bigCategories.json';
import middleCategories from './data/middleCategories.json';
import model from './data/model.json';
import initialRebatesMain from './data/rebates-main.json';
import initialRebatesDetails from './data/rebates-details.json';
import { 
  Corporation, 
  Category, 
  SalesDept, 
  BudgetDept, 
  PriceType, 
  RebateApplicationMain,
  RebateApplicationMainWithRelations,
  RebateApplicationDetail,
  RebateApplicationDetailWithRelations,
  PaginatedResult,
  RebateSearchParams,
  RebateStatus,
  RebateStats,
  Model,
  ApplicationType,
  BigCategory,
  MiddleCategory,
  BatchUpdateRebateDetailItem,
  CreateRebateRequest,
  CreateRebateDetailRequestItem,
  UpdateRebateWithDetailsRequest
} from '@/types/Rebate/rebate';

// 内存数据库
class MockDatabase {
  private corporations: Corporation[] = [];
  private categories: Category[] = [];
  private salesDepts: SalesDept[] = [];
  private budgetDepts: BudgetDept[] = [];
  private priceTypes: PriceType[] = [];
  private rebates: RebateApplicationMain[] = [];
  private rebateDetails: RebateApplicationDetail[] = [];
  private applicationTypes: ApplicationType[] = [];
  private bigCategories: BigCategory[] = [];
  private middleCategories: MiddleCategory[] = [];
  private models: Model[] = [];

  /**
   * 构造函数，初始化数据库实例并加载初始数据。
   */
  constructor() {
    this.init();
  }

  /**
   * @private
   * 初始化数据库，从 JSON 文件加载各类初始数据。
   * 并为加载的返利主表数据更新其聚合信息。
   */
  private init() {
    this.corporations = corporations as Corporation[];
    this.categories = categories as Category[];
    this.salesDepts = salesDepts as SalesDept[];
    this.budgetDepts = budgetDepts as BudgetDept[];
    this.priceTypes = priceTypes as PriceType[];
    this.applicationTypes = applicationTypes as ApplicationType[];
    this.bigCategories = bigCategories as BigCategory[];
    this.middleCategories = middleCategories as MiddleCategory[];
    this.models = model as Model[];

    this.rebates = initialRebatesMain as RebateApplicationMain[];
    this.rebateDetails = initialRebatesDetails as RebateApplicationDetail[];

    // 初始化完成后，为所有主表记录更新聚合数据
    this.rebates.forEach(mainRebate => {
      this._updateMainAggregatedData(mainRebate.id);
    });
  }

  /**
   * @private
   * 计算单个返利申请子表项的返利金额。
   * @param detail - 部分或完整的返利申请子表对象，至少包含计算所需字段。
   * @returns {number} 计算得到的返利金额，如果无法计算则返回 0。
   */
  private _calculateDetailRebateAmount(detail: Partial<RebateApplicationDetail>): number {
    if (!detail || !detail.applicationTypeId || typeof detail.quantity !== 'number') {
      return 0;
    }

    const appType = this.getApplicationTypeById(detail.applicationTypeId);
    if (!appType) {
      return 0;
    }

    switch (appType.id) {
      case 'app-001': // 按返利单价计算
        if (typeof detail.rebatePrice === 'number') {
          return detail.rebatePrice * detail.quantity;
        }
        break;

      case 'app-002': // 按返利率计算
        if (typeof detail.price === 'number' && typeof detail.rebateRate === 'number') {
          return detail.price * detail.quantity * detail.rebateRate;
        }
        break;
    }

    return 0;
  }

  /**
   * @private
   * 更新指定返利主表记录的聚合数据（总返利金额、包含的型号ID列表、型号名称字符串）。
   * 此方法会从关联的子表中重新计算这些聚合信息。
   * @param mainId - 需要更新聚合数据的主返利申请ID。
   */
  private _updateMainAggregatedData(mainId: string) {
    const main = this.rebates.find(r => r.id === mainId);
    if (!main) return;

    const details = this.rebateDetails.filter(d => d.rebateApplicationMainId === mainId);
    
    // 计算总金额
    const totalAmount = details.reduce((sum, detail) => sum + detail.itemRebateAmount, 0);
    
    // 收集所有型号ID
    const modelIds = [...new Set(details.map(d => d.modelId))];
    
    // 获取型号名称
    const modelNames = modelIds
      .map(id => this.models.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(';');

    // 更新主表
    main.totalRebateAmount = totalAmount;
    main.modelIds = modelIds;
    main.modelNames = modelNames;
  }

  // --- 基础数据查询方法 ---
  /**
   * 获取法人实体列表。
   * @param isActive - 可选参数，用于筛选是否活动的法人实体。
   * @returns {Corporation[]} 法人实体数组。
   */
  getCorporations(isActive?: boolean): Corporation[] {
    if (isActive !== undefined) {
      return this.corporations.filter(corp => corp.isActive === isActive);
    }
    return this.corporations;
  }

  /**
   * 获取返利区分列表。
   * @param isActive - 可选参数，用于筛选是否活动的返利区分。
   * @returns {Category[]} 返利区分数组。
   */
  getCategories(isActive?: boolean): Category[] {
    if (isActive !== undefined) {
      return this.categories.filter(cat => cat.isActive === isActive);
    }
    return this.categories;
  }

  /**
   * 获取销售区分列表。
   * @param isActive - 可选参数，用于筛选是否活动的销售区分。
   * @returns {SalesDept[]} 销售区分数组。
   */
  getSalesDepts(isActive?: boolean): SalesDept[] {
    if (isActive !== undefined) {
      return this.salesDepts.filter(dept => dept.isActive === isActive);
    }
    return this.salesDepts;
  }

  /**
   * 获取预算分类列表。
   * @param isActive - 可选参数，用于筛选是否活动的预算分类。
   * @returns {BudgetDept[]} 预算分类数组。
   */
  getBudgetDepts(isActive?: boolean): BudgetDept[] {
    if (isActive !== undefined) {
      return this.budgetDepts.filter(dept => dept.isActive === isActive);
    }
    return this.budgetDepts;
  }

  /**
   * 获取价格类型列表。
   * @param isActive - 可选参数，用于筛选是否活动的价格类型。
   * @returns {PriceType[]} 价格类型数组。
   */
  getPriceTypes(isActive?: boolean): PriceType[] {
    if (isActive !== undefined) {
      return this.priceTypes.filter(type => type.isActive === isActive);
    }
    return this.priceTypes;
  }

  /**
   * 获取申请类型列表。
   * @param isActive - 可选参数，用于筛选是否活动的申请类型。
   * @returns {ApplicationType[]} 申请类型数组。
   */
  getApplicationTypes(isActive?: boolean): ApplicationType[] {
    if (isActive !== undefined) {
      return this.applicationTypes.filter(type => type.isActive === isActive);
    }
    return this.applicationTypes;
  }

  /**
   * 获取大分类列表，可根据法人ID和活动状态筛选。
   * @param params - 包含筛选条件的参数对象。
   * @param params.corporationId - 可选，法人实体ID。
   * @param params.isActive - 可选，是否活动。
   * @returns {BigCategory[]} 大分类数组。
   */
  getBigCategories(params: { corporationId?: string; isActive?: boolean }): BigCategory[] {
    let filteredBigCategories = this.bigCategories;

    if (params.corporationId) {
      filteredBigCategories = filteredBigCategories.filter(m => m.corporationId === params.corporationId);
    }

    if (typeof params.isActive === 'boolean') {
      filteredBigCategories = filteredBigCategories.filter(m => m.isActive === params.isActive);
    }
    return filteredBigCategories;
  }

  /**
   * 获取中分类列表，可根据大分类ID和活动状态筛选。
   * @param params - 包含筛选条件的参数对象。
   * @param params.bigCategoryId - 可选，大分类ID。
   * @param params.isActive - 可选，是否活动。
   * @returns {MiddleCategory[]} 中分类数组。
   */
  getMiddleCategories(params: { bigCategoryId?: string; isActive?: boolean }): MiddleCategory[] {
    let filteredMiddleCategories = this.middleCategories;

    if (params.bigCategoryId) {
      filteredMiddleCategories = filteredMiddleCategories.filter(m => m.bigCategoryId === params.bigCategoryId);
    }

    if (typeof params.isActive === 'boolean') {
      filteredMiddleCategories = filteredMiddleCategories.filter(m => m.isActive === params.isActive);
    }
    return filteredMiddleCategories;
  }

  /**
   * 获取产品型号列表，可根据法人ID、大分类ID、中分类ID和活动状态筛选。
   * @param params - 包含筛选条件的参数对象。
   * @param params.corporationId - 可选，法人实体ID。
   * @param params.bigCategoryId - 可选，大分类ID。
   * @param params.middleCategoryId - 可选，中分类ID。
   * @param params.isActive - 可选，是否活动。
   * @returns {Model[]} 产品型号数组。
   */
  getModels(params: { 
    corporationId?: string; 
    bigCategoryId?: string;
    middleCategoryId?: string;
    isActive?: boolean 
  }): Model[] {
    let filteredModels = this.models;

    if (params.corporationId) {
      filteredModels = filteredModels.filter(m => m.corporationId === params.corporationId);
    }

    if (params.bigCategoryId) {
      filteredModels = filteredModels.filter(m => m.bigCategoryId === params.bigCategoryId);
    }

    if (params.middleCategoryId) {
      filteredModels = filteredModels.filter(m => m.middleCategoryId === params.middleCategoryId);
    }

    if (typeof params.isActive === 'boolean') {
      filteredModels = filteredModels.filter(m => m.isActive === params.isActive);
    }
    return filteredModels;
  }

  // --- 根据ID查找单个实体的方法 ---
  /**
   * 根据ID查找法人实体。
   * @param id - 法人实体ID。
   * @returns {Corporation | undefined} 对应的法人实体对象，未找到则返回 undefined。
   */
  getCorporationById(id: string): Corporation | undefined {
    return this.corporations.find(corp => corp.id === id);
  }

  /**
   * 根据ID查找返利区分。
   * @param id - 返利区分ID。
   * @returns {Category | undefined} 对应的返利区分对象，未找到则返回 undefined。
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find(cat => cat.id === id);
  }

  /**
   * 根据ID查找销售区分。
   * @param id - 销售区分ID。
   * @returns {SalesDept | undefined} 对应的销售区分对象，未找到则返回 undefined。
   */
  getSalesDeptById(id: string): SalesDept | undefined {
    return this.salesDepts.find(dept => dept.id === id);
  }

  /**
   * 根据ID查找预算分类。
   * @param id - 预算分类ID。
   * @returns {BudgetDept | undefined} 对应的预算分类对象，未找到则返回 undefined。
   */
  getBudgetDeptById(id: string): BudgetDept | undefined {
    return this.budgetDepts.find(dept => dept.id === id);
  }

  /**
   * 根据ID查找价格类型。
   * @param id - 价格类型ID。
   * @returns {PriceType | undefined} 对应的价格类型对象，未找到则返回 undefined。
   */
  getPriceTypeById(id: string): PriceType | undefined {
    return this.priceTypes.find(type => type.id === id);
  }

  /**
   * 根据ID查找申请类型。
   * @param id - 申请类型ID。
   * @returns {ApplicationType | undefined} 对应的申请类型对象，未找到则返回 undefined。
   */
  getApplicationTypeById(id: string): ApplicationType | undefined {
    return this.applicationTypes.find(type => type.id === id);
  }

  /**
   * 根据ID查找大分类。
   * @param id - 大分类ID。
   * @returns {BigCategory | undefined} 对应的大分类对象，未找到则返回 undefined。
   */
  getBigCategoryById(id: string): BigCategory | undefined {
    return this.bigCategories.find(cat => cat.id === id);
  }

  /**
   * 根据ID查找中分类。
   * @param id - 中分类ID。
   * @returns {MiddleCategory | undefined} 对应的中分类对象，未找到则返回 undefined。
   */
  getMiddleCategoryById(id: string): MiddleCategory | undefined {
    return this.middleCategories.find(cat => cat.id === id);
  }

  /**
   * 根据一组产品型号ID查找对应的产品型号详细数据。
   * @param ids - 产品型号ID数组。
   * @returns {Model[]} 包含找到的产品型号对象的数组，如果输入为空或未找到任何匹配项则返回空数组。
   */
  getModelByIds(ids: string[]): Model[]{
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.models.filter(model => ids.includes(model.id));
  }

  // --- 返利申请主表操作方法 ---
  /**
   * 根据ID查找返利申请主表记录。
   * @param id - 返利申请主表ID。
   * @returns {RebateApplicationMain | undefined} 对应的返利申请主表对象，未找到则返回 undefined。
   */
  getRebateById(id: string): RebateApplicationMain | undefined {
    return this.rebates.find(rebate => rebate.id === id);
  }

  /**
   * 根据返利申请主表ID获取其所有子表明细记录。
   * @param mainId - 返利申请主表ID。
   * @returns {RebateApplicationDetail[]} 关联的子表明细数组。
   */
  getRebateDetails(mainId: string): RebateApplicationDetail[] {
    return this.rebateDetails.filter(d => d.rebateApplicationMainId === mainId);
  }

  /**
   * 根据返利申请主表ID获取其所有子表明细记录，并填充关联数据。
   * @param mainId - 返利申请主表ID。
   * @returns {RebateApplicationDetailWithRelations[]} 关联的包含完整信息的子表明细数组。
   */
  getRebateDetailWithRelations(mainId: string): RebateApplicationDetailWithRelations[] {
    const details = this.getRebateDetails(mainId);
    return details.map(detail => {
      const applicationType = this.getApplicationTypeById(detail.applicationTypeId);
      const bigCategory = this.getBigCategoryById(detail.bigCategoryId);
      const middleCategory = this.getMiddleCategoryById(detail.middleCategoryId);
      const model = this.models.find(m => m.id === detail.modelId);
      const priceType = this.getPriceTypeById(detail.priceTypeId);

      if (!applicationType || !bigCategory || !middleCategory || !model || !priceType) {
        return null;
      }

      const { 
        rebateApplicationMainId,
        applicationTypeId,
        bigCategoryId,
        middleCategoryId,
        modelId,
        priceTypeId,
        ...rest
      } = detail;

      return {
        ...rest,
        applicationType,
        bigCategory,
        middleCategory,
        model,
        priceType
      };
    }).filter((detail): detail is RebateApplicationDetailWithRelations => detail !== null);
  }

  /**
   * 创建一条新的返利申请子表明细记录。
   * 创建后会自动更新其关联主表的聚合数据。
   * @param detail - 部分或完整的返利申请子表对象，用于创建新记录。
   * @returns {RebateApplicationDetail} 创建成功的子表明细对象。
   */
  createRebateDetail(detail: Partial<RebateApplicationDetail>): RebateApplicationDetail {
    const newId = `detail-${String(this.rebateDetails.length + 1).padStart(3, '0')}`;
    
    const newDetail: RebateApplicationDetail = {
      id: newId,
      rebateApplicationMainId: detail.rebateApplicationMainId!,
      applicationTypeId: detail.applicationTypeId!,
      bigCategoryId: detail.bigCategoryId!,
      middleCategoryId: detail.middleCategoryId!,
      modelId: detail.modelId!,
      priceTypeId: detail.priceTypeId!,
      price: detail.price || 0,
      quantity: detail.quantity || 0,
      rebatePrice: detail.rebatePrice || null,
      rebateRate: detail.rebateRate || null,
      itemRebateAmount: this._calculateDetailRebateAmount(detail)
    };

    this.rebateDetails.push(newDetail);
    this._updateMainAggregatedData(detail.rebateApplicationMainId!);
    return newDetail;
  }

  /**
   * 更新指定的返利申请子表明细记录。
   * 更新后会自动更新其关联主表的聚合数据。
   * @param id - 需要更新的子表明细ID。
   * @param updates - 包含待更新字段的部分子表明细对象。
   * @returns {RebateApplicationDetail | undefined} 更新成功的子表明细对象，未找到则返回 undefined。
   */
  updateRebateDetail(id: string, updates: Partial<RebateApplicationDetail>): RebateApplicationDetail | undefined {
    const index = this.rebateDetails.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    const detail = this.rebateDetails[index];
    const updatedDetail = {
      ...detail,
      ...updates,
      itemRebateAmount: this._calculateDetailRebateAmount({ ...detail, ...updates })
    };

    this.rebateDetails[index] = updatedDetail;
    this._updateMainAggregatedData(detail.rebateApplicationMainId);
    return updatedDetail;
  }

  /**
   * 删除指定的返利申请子表明细记录。
   * 删除后会自动更新其关联主表的聚合数据。
   * @param id - 需要删除的子表明细ID。
   * @returns {boolean} 如果删除成功返回 true，否则返回 false。
   */
  deleteRebateDetail(id: string): boolean {
    const index = this.rebateDetails.findIndex(d => d.id === id);
    if (index === -1) return false;

    const detail = this.rebateDetails[index];
    this.rebateDetails.splice(index, 1);
    this._updateMainAggregatedData(detail.rebateApplicationMainId);
    return true;
  }

  /**
   * 批量创建、更新或删除指定返利申请主表的子表明细记录。
   * 操作完成后会自动更新主表的聚合数据。
   * @param mainId - 关联的返利申请主表ID。
   * @param details - 包含操作指令和数据的子表明细项目数组。
   * @returns {RebateApplicationDetail[]} 包含所有成功创建或更新的子表明细对象的数组。
   */
  batchUpdateRebateDetails(mainId: string, detailsToUpdate: BatchUpdateRebateDetailItem[]): RebateApplicationDetail[] {
    const results: RebateApplicationDetail[] = [];

    for (const item of detailsToUpdate) {
      switch (item.action) {
        case 'create':
          if (item.id) {
            const newDetail = this.createRebateDetail({
              rebateApplicationMainId: mainId,
              applicationTypeId: item.applicationTypeId!,
              bigCategoryId: item.bigCategoryId!,
              middleCategoryId: item.middleCategoryId!,
              modelId: item.modelId!,
              priceTypeId: item.priceTypeId!,
              price: item.price,
              quantity: item.quantity,
              rebatePrice: item.rebatePrice,
              rebateRate: item.rebateRate
            });
            results.push(newDetail);
          }
          break;

        case 'update':
          if (item.id) {
            const updatedDetail = this.updateRebateDetail(item.id, {
              applicationTypeId: item.applicationTypeId,
              bigCategoryId: item.bigCategoryId,
              middleCategoryId: item.middleCategoryId,
              modelId: item.modelId,
              priceTypeId: item.priceTypeId,
              price: item.price,
              quantity: item.quantity,
              rebatePrice: item.rebatePrice,
              rebateRate: item.rebateRate
            });
            if (updatedDetail) {
              results.push(updatedDetail);
            }
          }
          break;

        case 'delete':
          if (item.id) {
            this.deleteRebateDetail(item.id);
          }
          break;
      }
    }

    return results;
  }

  /**
   * 根据ID获取返利申请主表记录及其所有关联数据（包括完整的子表明细列表）。
   * @param id - 返利申请主表ID。
   * @returns {RebateApplicationMainWithRelations | undefined} 包含完整关联数据的主表对象，未找到则返回 undefined。
   */
  getRebateWithRelationsById(id: string): RebateApplicationMainWithRelations | undefined {
    const rebate = this.getRebateById(id);
    if (!rebate) return undefined;

    const corporation = this.getCorporationById(rebate.corporationId);
    const category = this.getCategoryById(rebate.categoryId);
    const salesDept = this.getSalesDeptById(rebate.salesDeptId);
    const budgetDept = this.getBudgetDeptById(rebate.budgetDeptId);
    const details = this.getRebateDetailWithRelations(id);

    if (!corporation || !category || !salesDept || !budgetDept) {
      return undefined;
    }

    return {
      ...rebate,
      corporation,
      category,
      salesDept,
      budgetDept,
      details
    };
  }

  /**
   * 分页查询返利申请主表列表，并填充关联数据。
   * @param params - 查询参数对象，用于筛选和分页。
   * @returns {PaginatedResult<RebateApplicationMainWithRelations>} 分页的查询结果，包含数据列表和分页信息。
   */
  searchRebates(params: RebateSearchParams): PaginatedResult<RebateApplicationMainWithRelations> {
    let filteredRebates = this.rebates.slice();     //浅拷贝

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
    
    // 型号搜索：只要包含任意一个指定型号即可
    if (params.modelIds && params.modelIds.length > 0) {
      filteredRebates = filteredRebates.filter(r => 
        params.modelIds!.some(modelId => r.modelIds.includes(modelId))
      );
    }

    // 排序
    if (params.sortBy && params.sortOrder) {
      filteredRebates.sort((a, b) => {
        const valA = a[params.sortBy as keyof RebateApplicationMain];
        const valB = b[params.sortBy as keyof RebateApplicationMain];

        if (valA === undefined || valB === undefined) return 0;

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }

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
    const paginatedRebates: RebateApplicationMainWithRelations[] = [];
    const slicedRebates = filteredRebates.slice(startIndex, endIndex);

    for (const rebate of slicedRebates) {
      const rebateMain = rebate; // rebate from filteredRebates is RebateApplicationMain
      const rebateWithRelations = this.getRebateWithRelationsById(rebateMain.id);
      
      if (rebateWithRelations === undefined) {
        // 确定 getRebateWithRelationsById 为何会为 rebateMain.id 返回 undefined
        // getRebateWithRelationsById 的逻辑是：
        // 1. 调用 this.getRebateById(id) 获取主记录
        // 2. 如果主记录未找到，则返回 undefined
        // 3. 获取 corporation, category, salesDept, budgetDept
        // 4. 如果这四个中任何一个未找到，则返回 undefined
        
        const mainRecordForCheck = this.getRebateById(rebateMain.id);
        let problemDetails = "";

        if (!mainRecordForCheck) {
          // 这种情况理论上不应发生，因为 rebateMain 来自 filteredRebates，
          // 它们应该是有效的主记录。但这可以作为一个健全性检查。
          problemDetails = `主返利记录 (ID: ${rebateMain.id}) 在 getRebateWithRelationsById 内部通过 getRebateById 未找到。`;
        } else {
          // 如果主记录存在，则问题在于其关联数据
          const corporation = this.getCorporationById(rebateMain.corporationId);
          const category = this.getCategoryById(rebateMain.categoryId);
          const salesDept = this.getSalesDeptById(rebateMain.salesDeptId);
          const budgetDept = this.getBudgetDeptById(rebateMain.budgetDeptId);
          
          let missingParts: string[] = [];
          if (!corporation) missingParts.push(`法人(ID: ${rebateMain.corporationId})`);
          if (!category) missingParts.push(`返利区分(ID: ${rebateMain.categoryId})`);
          if (!salesDept) missingParts.push(`销售区分(ID: ${rebateMain.salesDeptId})`);
          if (!budgetDept) missingParts.push(`预算分类(ID: ${rebateMain.budgetDeptId})`);
          
          if (missingParts.length > 0) {
            problemDetails = `缺失关键的关联数据: ${missingParts.join('; ')}`;
          } else {
            // 如果所有检查的关联数据都存在，但仍然返回 undefined，
            // 这可能指向 getRebateWithRelationsById 内部逻辑的其他问题，
            // 或者 getRebateDetailWithRelations 的行为影响（尽管它不直接导致主函数返回 undefined）。
            problemDetails = "未知内部错误 (getRebateWithRelationsById 返回 undefined, 但所有直接检查的关联实体似乎都存在, 请检查函数内部逻辑)";
          }
        }
        console.warn(`[DB] searchRebates: 返利申请 (ID: ${rebateMain.id}, 申请No: ${rebateMain.applicationNumber}) 被过滤，因为它无法通过 getRebateWithRelationsById 完全加载。原因: ${problemDetails}`);
      } else {
        paginatedRebates.push(rebateWithRelations);
      }
    }

    return {
      data: paginatedRebates,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * 创建一个新的返利申请（包括主表和其关联的子表明细）。
   * @param request - 包含主表信息和初始子表明细列表的创建请求对象。
   * @returns {RebateApplicationMainWithRelations} 创建成功的、包含完整关联信息的主表对象。
   */
  createRebate(request: CreateRebateRequest): RebateApplicationMainWithRelations {
    // 1. 创建主表记录
    const newMainId = `main-${String(this.rebates.length + 1).padStart(3, '0')}`;
    const lastApplicationNumber = this.rebates
      .map(r => r.applicationNumber)
      .sort((a, b) => b.localeCompare(a))[0] || 'L202504000'; // 确保有默认值
    
    const applicationNumberParts = lastApplicationNumber.match(/L(\d+)(\d{3})$/);
    let newApplicationNumber = 'L202504001';
    if (applicationNumberParts) {
      const prefix = applicationNumberParts[1];
      const sequence = parseInt(applicationNumberParts[2]) + 1;
      newApplicationNumber = `L${prefix}${String(sequence).padStart(3, '0')}`;
    }

    const now = new Date().toISOString();
    const newRebateMain: RebateApplicationMain = {
      id: newMainId,
      applicationNumber: newApplicationNumber,
      corporationId: request.corporationId,
      categoryId: request.categoryId,
      salesDeptId: request.salesDeptId,
      budgetDeptId: request.budgetDeptId,
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
      title: request.title,
      description: request.description,
      applicantId: 'user-001', // 假设默认申请人，或从 request 中获取
      applicantName: 'HJS SFA Admin', // 假设默认申请人名，或从 request 中获取
      status: RebateStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      totalRebateAmount: 0, // 初始化，后续计算
      modelIds: [],         // 初始化，后续聚合
      modelNames: ''       // 初始化，后续聚合
    };
    this.rebates.push(newRebateMain);

    // 2. 根据 request.details 创建子表记录
    request.details.forEach((detailItem: CreateRebateDetailRequestItem) => {
      this.createRebateDetail({
        ...detailItem,
        rebateApplicationMainId: newMainId // 关联到刚创建的主表
      });
    });

    // 3. 更新主表的聚合数据 (createRebateDetail 内部已调用 _updateMainAggregatedData)
    // 但为确保最新，可以再调用一次，或者依赖 createRebateDetail 的调用
    this._updateMainAggregatedData(newMainId);

    // 4. 返回创建的包含完整关系的主表记录
    return this.getRebateWithRelationsById(newMainId)!;
  }

  /**
   * 同时更新返利申请主表信息及其子表明细。
   * @param request - 包含主表ID、待更新的主表字段和子表明细批量操作列表的请求对象。
   * @returns {RebateApplicationMainWithRelations | undefined} 更新成功的、包含完整关联信息的主表对象，如果主表未找到则返回 undefined。
   */
  updateRebateWithDetails(request: UpdateRebateWithDetailsRequest): RebateApplicationMainWithRelations | undefined {
    const { id, details, ...mainUpdates } = request;

    // 1. 更新主表信息 (不包括聚合字段，这些会在子表操作后重新计算)
    const updatedMain = this.updateRebate(id, mainUpdates as Partial<RebateApplicationMain>);
    if (!updatedMain) {
      console.warn(`[DB] updateRebateWithDetails: Main rebate with ID ${id} not found.`);
      return undefined;
    }

    // 2. 批量处理子表明细 (增/删/改)
    if (details && details.length > 0) {
      this.batchUpdateRebateDetails(id, details);
    }
    // batchUpdateRebateDetails 内部的 create/update/deleteRebateDetail 已经调用了 _updateMainAggregatedData
    // 所以这里不需要再次显式调用，除非 batchUpdateRebateDetails 的逻辑发生变化

    // 3. 返回更新后的包含完整关系的主表记录
    return this.getRebateWithRelationsById(id);
  }

  /**
   * 更新指定的返利申请主表的基础字段。
   * 此方法仅更新传入的字段和 `updatedAt` 时间戳，不处理子表或聚合字段。
   * @param id - 需要更新的主返利申请ID。
   * @param updates - 包含待更新字段的部分主返利申请对象。
   * @returns {RebateApplicationMain | undefined} 更新成功的主返利申请对象，未找到则返回 undefined。
   */
  updateRebate(id: string, updates: Partial<RebateApplicationMain>): RebateApplicationMain | undefined {
    const index = this.rebates.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    // 保留旧的聚合字段和创建时间，只更新传入的字段和 updatedAt
    const rebate = this.rebates[index];
    const updatedRebate = {
      ...rebate, // 保留旧的所有字段，包括 totalRebateAmount, modelIds, modelNames, createdAt
      ...updates, // 应用传入的更新
      updatedAt: new Date().toISOString() // 更新最后修改时间
  };

    this.rebates[index] = updatedRebate;
    return updatedRebate;
  }

  /**
   * 删除指定的返利申请主表记录及其所有关联的子表明细记录。
   * @param id - 需要删除的主返利申请ID。
   * @returns {boolean} 如果删除成功返回 true，否则返回 false。
   */
  deleteRebate(id: string): boolean {
    const index = this.rebates.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.rebates.splice(index, 1);
    // 同时删除关联的子表明细
    this.rebateDetails = this.rebateDetails.filter(detail => detail.rebateApplicationMainId !== id);
    return true;
  }

  /**
   * 获取返利申请的统计数据。
   * @returns {RebateStats} 包含各类状态返利申请数量的统计对象。
   */
  getRebateStats(): RebateStats {
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