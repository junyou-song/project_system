import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { 
  RebateSearchParams, 
  CreateRebateRequest, 
  UpdateRebateWithDetailsRequest,
  RebateStatus,
} from '@/types/Rebate/rebate';

// API基础路径
const API_BASE_PATH = '/api';

export const rebateHandlers = [
  // 获取返利申请列表
  http.get(`${API_BASE_PATH}/rebates`, ({ request }) => {
    const url = new URL(request.url);
    
    const params: RebateSearchParams = {
      applicationNumber: url.searchParams.get('applicationNumber') || undefined,
      corporationId: url.searchParams.get('corporationId') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      salesDeptId: url.searchParams.get('salesDeptId') || undefined,
      budgetDeptId: url.searchParams.get('budgetDeptId') || undefined,
      periodStart: url.searchParams.get('periodStart') || undefined,
      periodEnd: url.searchParams.get('periodEnd') || undefined,
      status: url.searchParams.get('status') as RebateStatus || undefined,
      applicantId: url.searchParams.get('applicantId') || undefined,
      title: url.searchParams.get('title') || undefined,
      sortBy: url.searchParams.get('sortBy') || undefined,
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string) : 1,
      pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') as string) : 10
    };

    const modelIdsParams = url.searchParams.getAll('modelIds');
    if (modelIdsParams && modelIdsParams.length > 0) {
      params.modelIds = modelIdsParams;
    }

    const result = db.searchRebates(params);
    return HttpResponse.json(result);
  }),

  // 获取返利统计数据 - 移动到这里，确保在:id匹配前处理
  http.get(`${API_BASE_PATH}/rebates/stats`, () => {
    console.log('[MSW] 拦截到获取返利统计数据请求');
    const stats = db.getRebateStats();
    
    return HttpResponse.json(stats);
  }),

  // 获取返利申请详情
  http.get(`${API_BASE_PATH}/rebates/:id`, ({ params }) => {
    const { id } = params;
    const rebate = db.getRebateWithRelationsById(id as string);
    
    if (!rebate) {
      return HttpResponse.json(
        { message: '找不到指定的返利申请记录' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(rebate);
  }),

  // 创建返利申请
  http.post(`${API_BASE_PATH}/rebates`, async ({ request }) => {
    const body = await request.json() as CreateRebateRequest;
    
    try {
      // db.createRebate 现在处理主表和子表的创建，并返回带关联的主表
      const newRebateWithRelations = db.createRebate(body);
      
      return HttpResponse.json(newRebateWithRelations, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { message: '创建返利申请失败', error: (error as Error).message },
        { status: 400 }
      );
    }
  }),

  // 更新返利申请
  http.put(`${API_BASE_PATH}/rebates/:id`, async ({ params, request }) => {
    const { id } = params;
    // 请求体现在是 UpdateRebateWithDetailsRequest
    const body = await request.json() as UpdateRebateWithDetailsRequest;
    
    // 检查记录是否存在 (db.updateRebateWithDetails 内部也会检查，但这里可以提前返回404)
    const existingRebate = db.getRebateById(id as string);
    if (!existingRebate) {
      return HttpResponse.json(
        { message: '找不到指定的返利申请记录' },
        { status: 404 }
      );
    }
    
    try {
      // 确保请求体中的 id 与路径参数的 id 一致 (或者 UpdateRebateWithDetailsRequest 不包含 id)
      // 我们的 UpdateRebateWithDetailsRequest 定义中包含了 id，所以可以进行校验
      if (body.id && body.id !== (id as string)) {
        return HttpResponse.json(
          { message: '请求体中的ID与路径参数ID不匹配' },
          { status: 400 }
        );
      }

      // 如果 body.id 不存在，则使用路径中的 id
      const requestData: UpdateRebateWithDetailsRequest = {
        ...body,
        id: id as string 
      };
      
      const updatedRebateWithRelations = db.updateRebateWithDetails(requestData);
      
      if (!updatedRebateWithRelations) {
        // 这种情况理论上在上面的 existingRebate 检查后不太会发生，除非 db 内部逻辑问题
        return HttpResponse.json(
          { message: '更新返利申请失败，记录可能已被删除' },
          { status: 404 } 
        );
      }
      
      return HttpResponse.json(updatedRebateWithRelations);
    } catch (error) {
      return HttpResponse.json(
        { message: '更新返利申请失败', error: (error as Error).message },
        { status: 400 }
      );
    }
  }),

  // 删除返利申请
  http.delete(`${API_BASE_PATH}/rebates/:id`, ({ params }) => {
    const { id } = params;
    
    const success = db.deleteRebate(id as string);
    if (!success) {
      return HttpResponse.json(
        { message: '找不到指定的返利申请记录' },
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // 获取所有法人
  http.get(`${API_BASE_PATH}/corporations`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
    
    const corporations = db.getCorporations(isActive);
    
    return HttpResponse.json(corporations);
  }),

  // 获取所有返利区分
  http.get(`${API_BASE_PATH}/categories`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
    
    const categories = db.getCategories(isActive);
    
    return HttpResponse.json(categories);
  }),

  // 获取所有销售区分
  http.get(`${API_BASE_PATH}/salesDepts`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
    
    const salesDepts = db.getSalesDepts(isActive);
    
    return HttpResponse.json(salesDepts);
  }),

  // 获取所有预算分类
  http.get(`${API_BASE_PATH}/budgetDepts`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
    
    const budgetDepts = db.getBudgetDepts(isActive);
    
    return HttpResponse.json(budgetDepts);
  }),

  // 获取所有价格类型
  http.get(`${API_BASE_PATH}/priceTypes`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
    
    const priceTypes = db.getPriceTypes(isActive);
    
    return HttpResponse.json(priceTypes);
  }),

  // 获取所有申请类型
  http.get(`${API_BASE_PATH}/applicationTypes`, ({ request }) => {
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive') === 'true' ? true : 
                     url.searchParams.get('isActive') === 'false' ? false : 
                     undefined;
      
    const applicationtype = db.getApplicationTypes(isActive);
      
    return HttpResponse.json(applicationtype);
  }),

  // 获取所有的大分类
  http.get(`${API_BASE_PATH}/bigCategories`, ({ request }) => {
    const url = new URL(request.url);

    // 解析查询参数
    const corporationId = url.searchParams.get('corporationId') || undefined;
    const isActive = url.searchParams.get('isActive') === 'true' ? true :
      url.searchParams.get('isActive') === 'false' ? false : undefined;

    // 获取型号数据
    let bigCategories = db.getBigCategories({ corporationId, isActive });

    return HttpResponse.json(bigCategories);
  }),

  // 获取所有的中分类
  http.get(`${API_BASE_PATH}/middleCategories`, ({ request }) => {
    const url = new URL(request.url);

    // 解析查询参数
    const bigCategoryId = url.searchParams.get('bigCategoryId') || undefined;
    const isActive = url.searchParams.get('isActive') === 'true' ? true :
      url.searchParams.get('isActive') === 'false' ? false : undefined;

    // 获取型号数据
    let middleCategories = db.getMiddleCategories({ bigCategoryId, isActive });

    return HttpResponse.json(middleCategories);
  }),

  // 获取所有产品型号
  http.get(`${API_BASE_PATH}/models`, ({ request }) => {
    const url = new URL(request.url);

    // 解析查询参数
    const corporationId = url.searchParams.get('corporationId') || undefined;
    const bigCategoryId = url.searchParams.get('bigCategoryId') || undefined;
    const middleCategoryId = url.searchParams.get('middleCategoryId') || undefined;
    const isActive = url.searchParams.get('isActive') === 'true' ? true :
      url.searchParams.get('isActive') === 'false' ? false : undefined;

    // 获取型号数据
    let models = db.getModels({ corporationId, bigCategoryId, middleCategoryId, isActive });

    return HttpResponse.json(models);
  })
]; 