import { useState, useEffect } from 'react';
import { rebateService } from '@/services/rebateService';
import { BigCategory, MiddleCategory, Model } from '@/types/Rebate/rebate';
import { App } from 'antd'; // For message

/**
 * @interface UseRebateCascadingLookupsProps
 * @description useRebateCascadingLookups Hook 的 Props 接口。
 * @property {string | undefined} selectedCorporationId - 当前选中的法人ID。驱动大分类的获取。
 * @property {string | undefined} selectedBigCategoryId - 当前选中的大分类ID。驱动中分类的获取。
 * @property {string | undefined} selectedMiddleCategoryId - 当前选中的中分类ID。驱动型号的获取。
 */
interface UseRebateCascadingLookupsProps {
  selectedCorporationId: string | undefined;
  selectedBigCategoryId: string | undefined;
  selectedMiddleCategoryId: string | undefined;
}

/**
 * @interface RebateCascadingLookups
 * @description useRebateCascadingLookups Hook 的返回类型接口。
 * @property {BigCategory[]} bigCategories - 基于所选法人可用的大分类列表。
 * @property {MiddleCategory[]} middleCategories - 基于所选大分类可用的中分类列表。
 * @property {Model[]} models - 基于所选法人、大分类和中分类可用的型号列表。
 * @property {boolean} loadingBigCategories - 大分类的加载状态。
 * @property {boolean} loadingMiddleCategories - 中分类的加载状态。
 * @property {boolean} loadingModels - 型号的加载状态。
 * @property {string | undefined} errorBigCategories - 如果加载大分类失败的错误消息。
 * @property {string | undefined} errorMiddleCategories - 如果加载中分类失败的错误消息。
 * @property {string | undefined} errorModels - 如果加载型号失败的错误消息。
 */
interface RebateCascadingLookups {
  bigCategories: BigCategory[];
  middleCategories: MiddleCategory[];
  models: Model[];
  loadingBigCategories: boolean;
  loadingMiddleCategories: boolean;
  loadingModels: boolean;
  errorBigCategories?: string;
  errorMiddleCategories?: string;
  errorModels?: string;
}

/**
 * @function useRebateCascadingLookups
 * @description 用于管理返利明细选择时级联下拉数据的自定义 Hook。
 * 根据 `selectedCorporationId` 获取大分类。
 * 根据 `selectedBigCategoryId` (和 `selectedCorporationId`) 获取中分类。
 * 根据 `selectedMiddleCategoryId` (和 `selectedBigCategoryId`, `selectedCorporationId`) 获取型号。
 * 处理每种数据类型的加载状态和错误。
 * @param {UseRebateCascadingLookupsProps} props - 驱动级联获取的ID参数。
 * @returns {RebateCascadingLookups} 一个包含获取的级联下拉数据、加载状态和错误信息的对象。
 */
export function useRebateCascadingLookups({
  selectedCorporationId,
  selectedBigCategoryId,
  selectedMiddleCategoryId,
}: UseRebateCascadingLookupsProps): RebateCascadingLookups {
  const { message } = App.useApp();

  const [bigCategories, setBigCategories] = useState<BigCategory[]>([]);
  const [middleCategories, setMiddleCategories] = useState<MiddleCategory[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loadingBigCategories, setLoadingBigCategories] = useState(false);
  const [loadingMiddleCategories, setLoadingMiddleCategories] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  
  const [errorBigCategories, setErrorBigCategories] = useState<string | undefined>(undefined);
  const [errorMiddleCategories, setErrorMiddleCategories] = useState<string | undefined>(undefined);
  const [errorModels, setErrorModels] = useState<string | undefined>(undefined);

  // 法人变更后，大分类加载
  useEffect(() => {
    setBigCategories([]);
    setMiddleCategories([]); 
    setModels([]);

    if (!selectedCorporationId) {
      return;
    }

    const loadBigCategories = async () => {
      setLoadingBigCategories(true);
      setErrorBigCategories(undefined);
      try {
        const data = await rebateService.getBigCategories({ corporationId: selectedCorporationId, isActive: true });
        setBigCategories(data);
      } catch (err) {
        const msg = '加载大分类数据失败';
        console.error(msg, err);
        message.error(msg);
        setErrorBigCategories(msg);
      } finally {
        setLoadingBigCategories(false);
      }
    };
    loadBigCategories();
  }, [selectedCorporationId, message]);

  // 大分类变更后，中分类加载
  useEffect(() => {
    setMiddleCategories([]);
    setModels([]); 

    if (!selectedBigCategoryId || !selectedCorporationId) { 
      return;
    }

    const loadMiddleCategories = async () => {
      setLoadingMiddleCategories(true);
      setErrorMiddleCategories(undefined);
      try {
        const data = await rebateService.getMiddleCategories({ bigCategoryId: selectedBigCategoryId, isActive: true });
        setMiddleCategories(data);
      } catch (err) {
        const msg = '加载中分类数据失败';
        console.error(msg, err);
        message.error(msg);
        setErrorMiddleCategories(msg);
      } finally {
        setLoadingMiddleCategories(false);
      }
    };
    loadMiddleCategories();
  }, [selectedBigCategoryId, selectedCorporationId, message]);

  // 中分类变更后，型号加载
  useEffect(() => {
    setModels([]);

    if (!selectedMiddleCategoryId || !selectedBigCategoryId || !selectedCorporationId) {
      return;
    }

    const loadModels = async () => {
      setLoadingModels(true);
      setErrorModels(undefined);
      try {
        const data = await rebateService.getModels({
          corporationId: selectedCorporationId,
          bigCategoryId: selectedBigCategoryId,
          middleCategoryId: selectedMiddleCategoryId,
          isActive: true
        });
        setModels(data);
      } catch (err) {
        const msg = '加载型号数据失败';
        console.error(msg, err);
        message.error(msg);
        setErrorModels(msg);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, [selectedMiddleCategoryId, selectedBigCategoryId, selectedCorporationId, message]);

  return {
    bigCategories,
    middleCategories,
    models,
    loadingBigCategories,
    loadingMiddleCategories,
    loadingModels,
    errorBigCategories,
    errorMiddleCategories,
    errorModels,
  };
} 