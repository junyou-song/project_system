import {
  RebateApplicationMain,
  RebateApplicationMainWithRelations,
  RebateSearchParams,
  PaginatedResult,
  CreateRebateRequest,
  UpdateRebateWithDetailsRequest,
  Corporation,
  Category,
  SalesDept,
  BudgetDept,
  PriceType,
  Model,
  RebateStatus,
  RebateStats,
  BigCategory,
  MiddleCategory,
  ApplicationType
} from '@/types/Rebate/rebate'; // 确保类型文件路径正确

// API 基础 URL (建议从环境变量或配置文件读取)
const API_BASE_URL = '/api';

// 辅助函数：构建查询字符串 (保持不变)
const buildQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // 确保数组中的值也被转换为字符串并编码
        return value.map(v => `${key}=${encodeURIComponent(String(v))}`).join('&');
      }
      // 确保所有值在编码前都转换为字符串
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  return query ? `?${query}` : '';
};

/**
 * 返利申请及相关数据的API服务
 */
export const rebateService = {

  /**
   * [私有] 核心 Fetch 辅助函数
   * 封装了 fetch 调用、错误检查、JSON 解析和无内容响应处理
   * @template T - 调用者期望的成功响应数据的类型 (例如 RebateApplicationMain[], RebateStats)
   * @param path API 路径 (例如 '/rebates', '/corporations')
   * @param options Fetch 的选项 (method, headers, body 等)，默认为空对象 {}
   * @param errorMessagePrefix 错误消息前缀，用于生成更具体的错误信息，默认为 '操作'
   * @returns Promise<T> - 一个解析为类型 T 的数据的 Promise，或在无内容响应时解析为 undefined
  */
  async _fetchApi<T>(path: string, options: RequestInit = {}, errorMessagePrefix: string = '操作'): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    try {
      const response = await fetch(url, options);

      // 检查是否是成功但无内容响应
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        if (response.ok) {
          return undefined as T; // 成功无内容
        } else {
          throw new Error(`${errorMessagePrefix}失败：服务器返回状态 ${response.status} 但无详细错误信息`);
        }
      }

      // 尝试解析 JSON 响应体
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (e) {
        if (!response.ok) {
          throw new Error(`${errorMessagePrefix}失败：${response.statusText}`);
        }
        console.error(`API 路径 ${path} 返回了非预期的非 JSON 响应`);
        throw new Error(`${errorMessagePrefix}失败：收到了无效的响应格式`);
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        throw new Error(`${errorMessagePrefix}失败：${responseData?.message || response.statusText}`);
      }

      // 返回成功解析的 JSON 数据
      return responseData as T;

    } catch (error) {
      console.error(`${errorMessagePrefix}时发生网络或处理错误: URL=${url}, Options=${JSON.stringify(options)}, Error:`, error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`${errorMessagePrefix}时发生未知错误: ${String(error)}`);
      }
    }
  },

  /**
     * [私有] 获取基础列表数据的辅助函数 (如公司, 类别等)，支持通用的查询参数
     * @template T - 调用者期望的列表中**单个元素**的类型 (例如 Corporation, Category, Model)
     * @param entityPath API 路径 (例如 '/corporations', '/models')
     * @param params 可选的查询参数对象 (例如 { isActive: true } 或 { corporationId: '123' })，默认为空对象 {}
     * @param entityName 用于错误消息的实体名称 (例如 '法人数据', '产品型号数据')，默认为 '列表'
     * @returns Promise<T[]> - 一个解析为类型 T 的**数组**的 Promise
  */
  async _fetchList<T>(entityPath: string, params: Record<string, any> = {}, entityName: string = '列表'): Promise<T[]> {
    const queryString = buildQueryString(params);
    // 确保_fetchApi 返回的是数组类型，如果 API 可能返回非数组，这里需要更复杂的错误处理
    const result = await this._fetchApi<T[] | null | undefined>(`${entityPath}${queryString}`, { method: 'GET' }, `获取${entityName}`);
    return Array.isArray(result) ? result : []; // 确保总是返回数组
  },

  /**
     * 获取返利申请列表 (分页、过滤)
     * @param params 包含过滤条件和分页信息 (如 page, pageSize) 的对象
     * @returns Promise<PaginatedResult<RebateApplicationMainWithRelations>> - 返回一个包含返利列表数据和分页信息的 Promise
  */
  async getRebates(params: RebateSearchParams): Promise<PaginatedResult<RebateApplicationMainWithRelations>> {
    const queryString = buildQueryString(params);
    // 假设 PaginatedResult 总是对象结构，如果 API 可能返回空，需要处理
    return await this._fetchApi<PaginatedResult<RebateApplicationMainWithRelations>>(`/rebates${queryString}`, { method: 'GET' }, '获取返利申请列表');
  },

  /**
   * 获取返利申请详情
   */
  async getRebateById(id: string): Promise<RebateApplicationMainWithRelations> {
    if (!id) throw new Error('获取返利申请详情失败：未提供 ID');
    return await this._fetchApi<RebateApplicationMainWithRelations>(`/rebates/${id}`, { method: 'GET' }, '获取返利申请详情');
  },

  /**
   * 创建返利申请
   */
  async createRebate(data: CreateRebateRequest): Promise<RebateApplicationMainWithRelations> {
    return await this._fetchApi<RebateApplicationMainWithRelations>('/rebates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, '创建返利申请');
  },

  /**
   * 更新返利申请 (包括主表和子表明细)
   * @param data 包含要更新的返利申请主表ID、主表字段及子表操作列表。
   */
  async updateRebate(data: UpdateRebateWithDetailsRequest): Promise<RebateApplicationMainWithRelations> {
    if (!data.id) throw new Error('更新返利申请失败：请求数据中未提供返利申请主表 ID');
    return await this._fetchApi<RebateApplicationMainWithRelations>(`/rebates/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) // 发送整个 UpdateRebateWithDetailsRequest 对象
    }, '更新返利申请');
  },

  /**
   * 删除返利申请
   */
  async deleteRebate(id: string): Promise<void> {
    if (!id) throw new Error('删除返利申请失败：未提供 ID');
    await this._fetchApi<void>(`/rebates/${id}`, { method: 'DELETE' }, '删除返利申请');
  },

  /**
   * 获取返利统计数据
   */
  async getRebateStats(): Promise<RebateStats> { // 使用定义的 RebateStats 类型
    // 传入正确的泛型参数 RebateStats
    return await this._fetchApi<RebateStats>('/rebates/stats', { method: 'GET' }, '获取返利统计数据');
  },

  /**
   * 获取所有法人
   */
  async getCorporations(isActive?: boolean): Promise<Corporation[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<Corporation>('/corporations', params, '法人数据');
  },

  /**
   * 获取所有返利区分
   */
  async getCategories(isActive?: boolean): Promise<Category[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<Category>('/categories', params, '返利区分数据');
  },

  /**
   * 获取所有销售区分
   */
  async getSalesDepts(isActive?: boolean): Promise<SalesDept[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<SalesDept>('/salesDepts', params, '销售区分数据');
  },

  /**
   * 获取所有预算分类
   */
  async getBudgetDepts(isActive?: boolean): Promise<BudgetDept[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<BudgetDept>('/budgetDepts', params, '预算分类数据');
  },

  /**
   * 获取所有价格类型
   */
  async getPriceTypes(isActive?: boolean): Promise<PriceType[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<PriceType>('/priceTypes', params, '价格类型数据');
  },
  
  /**
   * 获取大分类列表 (统一入口)
   * @param corporationId - 法人 ID，用于筛选大分类列表
   */
  async getBigCategories(params?: { corporationId?: string; isActive?: boolean }): Promise<BigCategory[]> {
      return this._fetchList<BigCategory>('/bigCategories', params || {}, '大分类数据');
  },

    /**
   * 获取中分类列表 (统一入口)
   * @param bigCategoryId - 大分类 ID，用于筛选中分类列表
   */
    async getMiddleCategories(params?: { bigCategoryId?: string; isActive?: boolean }): Promise<MiddleCategory[]> {
      return this._fetchList<MiddleCategory>('/middleCategories', params || {}, '中分类数据');
  },

  /**
   * 获取产品型号列表 (统一入口)
   * @param corporationId - 法人 ID，用于筛选产品型号列表
   * @param bigCategoryId - 大分类 ID，用于筛选产品型号列表
   * @param middleCategoryId - 中分类 ID，用于筛选产品型号列表
   */
  async getModels(params?: { corporationId?: string; bigCategoryId?: string; middleCategoryId?: string; isActive?: boolean }): Promise<Model[]> {
    return this._fetchList<Model>('/models', params || {}, '产品型号数据');
  },

  /**
   * 获取所有申请类型
   * @param isActive 可选，用于筛选是否活动的申请类型
   */
  async getApplicationTypes(isActive?: boolean): Promise<ApplicationType[]> {
    const params: Record<string, any> = {};
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    return this._fetchList<ApplicationType>('/applicationTypes', params, '申请类型数据');
  }
};