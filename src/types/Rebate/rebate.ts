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
  // 例如: applicationTypeId '001' -> rebatePrice有值; '002' -> rebateRate有值
  rebatePrice?: number | null;      // 单件返利金额
  rebateRate?: number | null;       // 返利率 
  // 后端计算: 
  // 若按返利单价: quantity * rebatePrice
  // 若按返利率: price * quantity * rebateRate
  itemRebateAmount: number;         // 此明细项的返利金额 
}

// 返利申请主表
export interface RebateApplicationMain {
  id: string;                       // 主申请记录ID
  applicationNumber: string;        // 申请编号 (唯一)
  corporationId: string;            // 法人实体ID
  categoryId: string;               // 返利区分ID
  salesDeptId: string;              // 销售区分ID
  budgetDeptId: string;             // 预算分类ID
  // applicationTypeId 已移至 RebateApplicationDetail
  periodStart: string;              // 返利期间 - 开始日期
  periodEnd: string;                // 返利期间 - 结束日期
  title: string;                    // 申请标题
  description?: string;             // 申请描述
  comment?: string;                 // 备注/审批意见
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
  // applicationType 已移至 RebateApplicationDetailWithRelations
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
}

// 创建返利申请的请求数据 (主表 + 子表明细列表)
export interface CreateRebateRequest {
  corporationId: string;
  categoryId: string;
  salesDeptId: string;
  budgetDeptId: string;
  // applicationTypeId 已移至 CreateRebateDetailRequestItem
  periodStart: string;
  periodEnd: string;
  title: string;
  description?: string;
  comment?: string; // 申请时即可填写备注
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
  // applicationTypeId 已移至子表层面，主表更新不包含此字段
  periodStart?: string;
  periodEnd?: string;
  title?: string;
  description?: string;
  comment?: string;
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
  // applicationTypeId 已移至子表层面，若要按类型搜索，需特殊处理查询逻辑
  modelId?: string;                 // 按包含的某个具体型号ID搜索 (注意: RebateApplicationMain.modelIds是数组)
                                    // 如果要实现"包含列出的所有型号"或"包含任意一个列出型号"的查询，后端需要特殊处理
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