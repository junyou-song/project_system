import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { RebateSearchParams, CreateRebateRequest, UpdateRebateRequest, RebateStatus } from '@/types/Rebate/rebate';

// API基础路径
const API_BASE_PATH = '/api';

export const rebateHandlers = [
  // 获取返利申请列表
  http.get(`${API_BASE_PATH}/rebates`, ({ request }) => {
    const url = new URL(request.url);
    
    // 解析查询参数
    const params: RebateSearchParams = {
      applicationNumber: url.searchParams.get('applicationNumber') || undefined,
      corporationId: url.searchParams.get('corporationId') || undefined,
      categoryId: url.searchParams.get('categoryId') || undefined,
      salesDeptId: url.searchParams.get('salesDeptId') || undefined,
      budgetDeptId: url.searchParams.get('budgetDeptId') || undefined,
      bigCategoryId: url.searchParams.get('bigCategoryId') || undefined,
      middleCategoryId: url.searchParams.get('middleCategoryId') || undefined,
      applicationTypeId: url.searchParams.get('applicationTypeId') || undefined,
      periodStart: url.searchParams.get('periodStart') || undefined,
      periodEnd: url.searchParams.get('periodEnd') || undefined,
      status: url.searchParams.get('status') as RebateStatus || undefined,
      applicantId: url.searchParams.get('applicantId') || undefined,
      title: url.searchParams.get('title') || undefined,
      priceTypeId: url.searchParams.get('priceTypeId') || undefined,
      sortBy: url.searchParams.get('sortBy') || undefined,
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
      page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string) : 1,
      pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') as string) : 10
    };

    // 处理型号数组参数
    // URL查询参数中，数组通常以重复参数的形式传递，例如：?modelIds=id1&modelIds=id2
    const modelIdsParams = url.searchParams.getAll('modelIds');
    if (modelIdsParams && modelIdsParams.length > 0) {
      params.modelIds = modelIdsParams;
    }

    // 查询数据
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
      // 确保modelIds是数组
      if (!Array.isArray(body.modelIds)) {
        body.modelIds = body.modelIds ? [body.modelIds] : [];
      }

      // 根据型号数组拿到所有的型号
      const currentModels = db.getModelByIds(body.modelIds)
      const modelNames = currentModels.map(model => model.name).join(';');

      // 计算返利金额
      // const rebateAmount = db.calculateRebateAmount(body);

      const newRebate = db.createRebate({
        ...body,
        modelNames: modelNames
      });
      
      return HttpResponse.json(newRebate, { status: 201 });
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
    const body = await request.json() as UpdateRebateRequest;
    
    // 检查记录是否存在
    const existingRebate = db.getRebateById(id as string);
    if (!existingRebate) {
      return HttpResponse.json(
        { message: '找不到指定的返利申请记录' },
        { status: 404 }
      );
    }
    
    try {
      
      let updates = { ...body };

      // 处理modelIds的更新
      // 确保modelIds是数组
      if (body.modelIds) {
        if (!Array.isArray(updates.modelIds))
          updates.modelIds = updates.modelIds ? [updates.modelIds] : [];
      }

      // 处理modelIds的更新
      let currentModels  = [];
      if (body.modelIds && Array.isArray(body.modelIds)) { // 确保存在且是数组
        currentModels = db.getModelByIds(body.modelIds);
        updates.modelNames = currentModels.map(model => model.name).join(';');
      } else {
        updates.modelNames = '';
      }

      
      const updatedRebate = db.updateRebate(id as string, updates);
      
      return HttpResponse.json(updatedRebate);
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