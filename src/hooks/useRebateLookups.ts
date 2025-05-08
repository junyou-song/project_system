import { useState, useEffect } from 'react';
import { rebateService } from '@/services/rebateService';
import {
  Corporation,
  Category,
  SalesDept,
  BudgetDept,
  PriceType,
  ApplicationType
} from '@/types/Rebate/rebate';
import { App } from 'antd'; // 假设 App.useApp() 可以这样引入或通过参数传递

/**
 * @interface RebateLookups
 * @description useRebateLookups Hook 返回的基础下拉数据的结构。
 * @property {Corporation[]} corporations - 法人实体列表。
 * @property {Category[]} categories - 返利区分列表。
 * @property {SalesDept[]} salesDepts - 销售区分列表。
 * @property {BudgetDept[]} budgetDepts - 预算分类列表。
 * @property {PriceType[]} priceTypes - 价格类型列表。
 * @property {ApplicationType[]} applicationTypes - 申请类型列表。
 * @property {boolean} dataLoading - 指示下拉数据是否正在加载的标志。
 * @property {string | undefined} error - 如果数据加载失败，则为错误消息。
 */
interface RebateLookups {
  corporations: Corporation[];
  categories: Category[];
  salesDepts: SalesDept[];
  budgetDepts: BudgetDept[];
  priceTypes: PriceType[];
  applicationTypes: ApplicationType[];
  dataLoading: boolean;
  error?: string;
}

/**
 * @function useRebateLookups
 * @description 用于获取和管理返利表单所需基础下拉数据的自定义 Hook。
 * 包括法人、返利区分、销售区分、预算分类、价格类型和申请类型。
 * 此 Hook 处理异步数据获取、加载状态和潜在错误。
 * 使用 `App.useApp()` 来显示消息。
 * @returns {RebateLookups} 一个包含获取的下拉数据、加载状态和任何错误信息的对象。
 */
export function useRebateLookups(): RebateLookups {
  const { message } = App.useApp(); //  如果直接在hook中使用App.useApp()有问题，需要从调用组件传递message实例

  const [corporations, setCorporations] = useState<Corporation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [salesDepts, setSalesDepts] = useState<SalesDept[]>([]);
  const [budgetDepts, setBudgetDepts] = useState<BudgetDept[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadLookupData = async () => {
      setDataLoading(true);
      setError(undefined);
      try {
        const [
          corporationsData,
          categoriesData,
          salesDeptsData,
          budgetDeptsData,
          priceTypesData,
          appTypesData,
        ] = await Promise.all([
          rebateService.getCorporations(true),
          rebateService.getCategories(true),
          rebateService.getSalesDepts(true),
          rebateService.getBudgetDepts(true),
          rebateService.getPriceTypes(true),
          rebateService.getApplicationTypes(true),
        ]);

        setCorporations(corporationsData);
        setCategories(categoriesData);
        setSalesDepts(salesDeptsData);
        setBudgetDepts(budgetDeptsData);
        setPriceTypes(priceTypesData);
        setApplicationTypes(appTypesData);
      } catch (err) {
        console.error('加载下拉选项数据失败:', err);
        const errorMessage = err instanceof Error ? err.message : '加载下拉选项数据失败';
        message.error(errorMessage);
        setError(errorMessage);
      } finally {
        setDataLoading(false);
      }
    };

    loadLookupData();
  }, [message]); // message 依赖

  return {
    corporations,
    categories,
    salesDepts,
    budgetDepts,
    priceTypes,
    applicationTypes,
    dataLoading,
    error,
  };
} 