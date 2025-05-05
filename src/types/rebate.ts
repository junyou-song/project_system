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

// 产品型号
export interface Model { 
  id: string;
  name: string;
  code: string;
  corporationId: string; // 法人实体ID(关联法人实体表)
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

// 返利申请记录
export interface RebateRecord {
  id: string;
  applicationNumber: string;
  corporationId: string;
  categoryId: string;
  salesDeptId: string;
  budgetDeptId: string;
  modelIds: string[];
  modelNames?: string;
  periodStart: string; // 格式: YYYY-MM-DD
  periodEnd: string;   // 格式: YYYY-MM-DD
  status: RebateStatus;
  range: string;
  priceTypeId: string;
  price: number;
  quantity: number;
  applicationType: string;
  rebatePrice: number;
  rebateAmount: number;
  title: string;
  description?: string;
  comment?: string;
  applicantId: string;
  applicantName: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// 包含关联数据的完整返利记录
export interface RebateRecordWithRelations extends RebateRecord {
  corporation: Corporation;
  category: Category;
  salesDept: SalesDept;
  budgetDept: BudgetDept;
  priceType: PriceType;
  models: Model[];
}

// 返利申请列表的查询参数
export interface RebateSearchParams {
  applicationNumber?: string;
  corporationId?: string;
  categoryId?: string;
  salesDeptId?: string;
  budgetDeptId?: string;
  modelIds?: string[];
  periodStart?: string;
  periodEnd?: string;
  status?: RebateStatus;
  applicantId?: string;
  title?: string;
  priceTypeId?: string;
  page?: number;
  pageSize?: number;
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 创建返利申请的请求数据
export interface CreateRebateRequest {
  corporationId: string;
  categoryId: string;
  salesDeptId: string;
  budgetDeptId: string;
  modelIds: string[];
  modelNames?: string;
  periodStart: string;
  periodEnd: string;
  range: string;
  priceTypeId: string;
  price: number;
  quantity: number;
  applicationType: string;
  rebatePrice: number;
  title: string;
  description?: string;
  comment?: string;
}

// 更新返利申请的请求数据
export interface UpdateRebateRequest extends Partial<CreateRebateRequest> {
  id: string;
  status?: RebateStatus;
  rebateAmount?: number;
} 