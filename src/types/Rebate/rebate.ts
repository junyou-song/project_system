// 法人实体
export interface Corporation {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

// 返利区分
export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// 销售区分
export interface SalesDept {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// 预算分类
export interface BudgetDept {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// 价格类型
export interface PriceType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// 申请类型
export interface ApplicationType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// 大分类
export interface BigCategory {
  id: string;
  name: string;
  code: string;
  corporationId: string; // 法人实体ID(关联法人实体表)
  description?: string;
  isActive: boolean;
}

// 中分类
export interface MiddleCategory {
  id: string;
  name: string;
  code: string;
  bigCategoryId: string; // 大分类ID(关联大分类表)
  description?: string;
  isActive: boolean;
}

// 产品型号
export interface Model { 
  id: string;
  name: string;
  code: string;
  corporationId: string; // 法人实体ID(关联法人实体表)
  bigCategoryId: string; // 大分类ID(关联大分类表)
  middleCategoryId: string; // 中分类ID(关联中分类表)
  description?: string;
  isActive: boolean;
}

// 返利状态
export enum RebateStatus {
  DRAFT = 'draft',           // 草稿
  PENDING = 'pending',       // 等待审核
  IN_REVIEW = 'in_review',   // 审核中
  APPROVED = 'approved',     // 已批准
  REJECTED = 'rejected',     // 已拒绝
  COMPLETED = 'completed'    // 已完成
}

// 返利状态显示文本映射
export const RebateStatusText: Record<RebateStatus, string> = {
  [RebateStatus.DRAFT]: '草稿',
  [RebateStatus.PENDING]: '待审核',
  [RebateStatus.IN_REVIEW]: '在审确认',
  [RebateStatus.APPROVED]: '已批准',
  [RebateStatus.REJECTED]: '已拒绝',
  [RebateStatus.COMPLETED]: '已完成'
};

// 返利统计
export interface RebateStats {
  total: number;
  inReview: number;
  completed: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

// 返利申请子表 (返利明细)
export interface RebateApplicationDetail {
  id: string;                       // 子表记录ID
  rebateApplicationMainId: string;  // 关联主表ID
  applicationTypeId: string;        // 申请类型ID (决定使用rebatePrice还是rebateRate)
  bigCategoryId: string;            // 大分类ID
  middleCategoryId: string;         // 中分类ID
  modelId: string;                  // 产品型号ID
  priceTypeId: string;              // 价格类型ID
  price: number;                    // 标准单价
  quantity: number;                 // 数量
  // 根据子表的applicationTypeId，rebatePrice和rebateRate只有一个应有值
  // 如: applicationTypeId 'app-001' -> rebatePrice有值; 'app-002' -> rebateRate有值
  rebatePrice?: number | null;      // 单件返利金额
  rebateRate?: number | null;       // 返利率 
  // 后端计算: 
  // 若按返利单价: quantity * rebatePrice
  // 若按返利率: price * quantity * rebateRate
  itemRebateAmount: number;         // 此明细项的返利金额
  comment?: string;                 // 备注/审批意见
}

// 返利申请主表
export interface RebateApplicationMain {
  id: string;                       // 主申请记录ID
  applicationNumber: string;        // 申请编号 (唯一)
  corporationId: string;            // 法人实体ID
  categoryId: string;               // 返利区分ID
  salesDeptId: string;              // 销售区分ID
  budgetDeptId: string;             // 预算分类ID
  periodStart: string;              // 返利期间 - 开始日期
  periodEnd: string;                // 返利期间 - 结束日期
  title: string;                    // 申请标题
  description?: string;             // 申请描述
  applicantId: string;              // 申请人ID
  applicantName: string;            // 申请人姓名
  status: RebateStatus;             // 返利状态
  createdAt: string;                // 创建时间
  updatedAt: string;                // 最后更新时间
  approvedBy?: string;              // 批准人ID
  approvedAt?: string;              // 批准时间
  totalRebateAmount: number;        // 总返利金额 (所有子表itemRebateAmount之和, 后端计算)
  modelIds: string[];               // 包含的所有产品型号ID (从子表聚合, 后端生成)
  modelNames: string;               // 包含的所有产品型号名称 (分号分隔, 从子表聚合, 后端生成)
}

// 包含关联数据的完整返利申请子表记录
export interface RebateApplicationDetailWithRelations extends Omit<RebateApplicationDetail, 'bigCategoryId' | 'middleCategoryId' | 'modelId' | 'priceTypeId' | 'rebateApplicationMainId' | 'applicationTypeId'> {
  applicationType: ApplicationType;
  bigCategory: BigCategory;
  middleCategory: MiddleCategory;
  model: Model;
  priceType: PriceType;
}

// 包含关联数据的完整返利申请主表记录 (包含完整的子表明细)
export interface RebateApplicationMainWithRelations extends Omit<RebateApplicationMain, 'corporationId' | 'categoryId' | 'salesDeptId' | 'budgetDeptId'> { // Removed applicationTypeId from Omit
  corporation: Corporation;
  category: Category;
  salesDept: SalesDept;
  budgetDept: BudgetDept;
  details: RebateApplicationDetailWithRelations[]; // 完整的子表明细列表
}

// 创建返利申请时，子表明细的数据结构
export interface CreateRebateDetailRequestItem {
  applicationTypeId: string; // 此明细项的申请类型
  bigCategoryId: string;
  middleCategoryId: string;
  modelId: string;
  priceTypeId: string;
  price: number;
  quantity: number;
  // 根据applicationTypeId，rebatePrice和rebateRate只有一个应有值
  rebatePrice?: number; 
  rebateRate?: number;  
  itemRebateAmount?: number;
  comment?: string;
}

// 表格行项数据类型 - 对应子表明细 CreateRebateDetailRequestItem + key + 计算/展示用字段
export interface RebateItemDetail extends CreateRebateDetailRequestItem {
  key: string; // 前端UI表格行唯一标识
  itemRebateAmount: number; // 前端计算的此行返利金额
  // 为了在表格中直接显示名称/代码，而不是仅ID
  bigCategoryName?: string;
  middleCategoryName?: string;
  modelCode?: string; // 型号通常显示code
  priceTypeName?: string;
}

// 创建返利申请的请求数据 (主表 + 子表明细列表)
export interface CreateRebateRequest {
  corporationId: string;
  categoryId: string;
  salesDeptId: string;
  budgetDeptId: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  description?: string;
  details: CreateRebateDetailRequestItem[]; // 子表明细项目
}

// 更新返利申请的请求数据 (主要更新主表信息和状态)
// 注意: 子表的批量更新/删除/新增 通常更复杂，可能需要单独的接口或更精细的结构。
// 此处简化为仅更新主表可修改字段和状态。
export interface UpdateRebateRequest {
  id: string; // 要更新的主申请ID
  corporationId?: string;
  categoryId?: string;
  salesDeptId?: string;
  budgetDeptId?: string;
  periodStart?: string;
  periodEnd?: string;
  title?: string;
  description?: string;
  status?: RebateStatus; // 主要用于更新状态，如提交、审批等
  // totalRebateAmount, modelIds, modelNames 由后端根据子表计算和聚合，不允许直接修改
  // details的更新需要更复杂的策略，例如提供一个details数组来完全替换，或者提供单独的增删改明细的接口
}

// 返利申请列表的查询参数
export interface RebateSearchParams {
  applicationNumber?: string;       // 按申请编号搜索
  corporationId?: string;           // 按法人实体筛选
  categoryId?: string;              // 按返利区分筛选
  salesDeptId?: string;             // 按销售区分筛选
  budgetDeptId?: string;            // 按预算部门筛选
  modelIds?: string[];              // 按包含的型号ID数组搜索，只要包含其中任意一个型号即可
  periodStart?: string;             // 按返利期间开始日期筛选
  periodEnd?: string;               // 按返利期间结束日期筛选
  status?: RebateStatus;            // 按状态筛选
  applicantId?: string;             // 按申请人ID筛选
  title?: string;                   // 按标题模糊搜索
  sortBy?: keyof RebateApplicationMain | string; // 排序字段 (可以是主表字段名)
  sortOrder?: 'asc' | 'desc';       // 排序顺序
  page?: number;                    // 页码
  pageSize?: number;                // 每页数量
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 子表明细批量更新操作类型
export enum UpdateRebateDetailAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// 批量更新/创建/删除子表明细的单个项目
// - 对于 CREATE: 提供 CreateRebateDetailRequestItem 中的所有必填字段
// - 对于 UPDATE: 提供 id 和需要更新的字段
// - 对于 DELETE: 只需要提供 id
export interface BatchUpdateRebateDetailItem {
  action: UpdateRebateDetailAction; // 操作类型
  id?: string;                      // 要更新或删除的明细项ID (对于CREATE可选，对于UPDATE/DELETE必选)
  applicationTypeId?: string;       // 申请类型ID
  bigCategoryId?: string;           // 大分类ID
  middleCategoryId?: string;        // 中分类ID
  modelId?: string;                 // 产品型号ID
  priceTypeId?: string;             // 价格类型ID
  price?: number;                   // 标准单价
  quantity?: number;                // 数量
  rebatePrice?: number | null;      // 单件返利金额
  rebateRate?: number | null;       // 返利率
  comment?: string;                 // 备注/审批意见
}

// 批量更新返利申请子表的请求数据
export interface BatchUpdateRebateDetailsRequest {
  rebateApplicationMainId: string;      // 关联的主返利申请ID
  details: BatchUpdateRebateDetailItem[]; // 需要处理的子表明细列表
}

// 同时更新主表和子表的请求数据
export interface UpdateRebateWithDetailsRequest {
  // 主表更新字段
  id: string;                           // 主申请ID
  corporationId?: string;               // 法人实体ID
  categoryId?: string;                  // 返利区分ID
  salesDeptId?: string;                 // 销售区分ID
  budgetDeptId?: string;                // 预算分类ID
  periodStart?: string;                 // 返利期间 - 开始日期
  periodEnd?: string;                   // 返利期间 - 结束日期
  title?: string;                       // 申请标题
  description?: string;                 // 申请描述
  status?: RebateStatus;                // 返利状态

  // 子表明细批量更新
  details: BatchUpdateRebateDetailItem[]; // 需要处理的子表明细列表
} 