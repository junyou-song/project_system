import React, { useState, useCallback, useMemo } from 'react';
import { Form, App } from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  CreateRebateDetailRequestItem,
  PriceType,
  BigCategory,
  MiddleCategory,
  Model,
  ApplicationType,
  RebateItemDetail,
} from '@/types/Rebate/rebate';

/**
 * @interface UseRebateItemManagerProps
 * @description useRebateItemManager Hook 的 Props 接口。
 * @property {PriceType[]} priceTypes - 可用的价格类型列表。
 * @property {BigCategory[]} allBigCategories - 所有可用的大分类列表 (通常基于法人进行筛选)。
 * @property {MiddleCategory[]} allMiddleCategories - 所有可用的中分类列表 (通常基于大分类进行筛选)。
 * @property {Model[]} allModels - 所有可用的型号列表 (通常基于中分类进行筛选)。
 * @property {ApplicationType[]} applicationTypes - 可用的申请类型列表。
 * @property {FormInstance} mainForm - 主返利申请的表单实例，用于在添加明细前进行校验。
 * @property {(modified: boolean) => void} setFormModified - 用于设置主表单修改状态的回调函数。
 * @property {(id: string | undefined) => void} setSelectedModalBigCategoryId - 用于设置弹窗内选中大分类ID的回调函数 (驱动级联数据的获取)。
 * @property {(id: string | undefined) => void} setSelectedModalMiddleCategoryId - 用于设置弹窗内选中中分类ID的回调函数 (驱动级联数据的获取)。
 */
interface UseRebateItemManagerProps {
  priceTypes: PriceType[];
  allBigCategories: BigCategory[];
  allMiddleCategories: MiddleCategory[];
  allModels: Model[];
  applicationTypes: ApplicationType[];
  mainForm: FormInstance; // Main form for validation before adding row
  setFormModified: (modified: boolean) => void;
  setSelectedModalBigCategoryId: (id: string | undefined) => void;
  setSelectedModalMiddleCategoryId: (id: string | undefined) => void;
}

/**
 * @interface RebateItemManager
 * @description useRebateItemManager Hook 的返回类型接口。
 * @property {FormInstance<CreateRebateDetailRequestItem>} itemForm - 返利明细弹窗的 Ant Design 表单实例。
 * @property {RebateItemDetail[]} tableData - 当前表格中返利明细的数组。
 * @property {React.Dispatch<React.SetStateAction<RebateItemDetail[]>>} setTableData - tableData 的 setter 函数 (如果需要直接操作，则暴露；通常通过处理器管理)。
 * @property {React.Key[]} selectedRowKeys - 表格中当前选中行的 Key 数组。
 * @property {React.Dispatch<React.SetStateAction<React.Key[]>>} setSelectedRowKeys - selectedRowKeys 的 setter 函数。
 * @property {boolean} modalVisible - 添加/编辑明细弹窗的可见状态。
 * @property {boolean} modalLoading - 弹窗的加载状态 (例如，提交期间)。
 * @property {string} editingKey - 当前正在编辑的明细的 Key，如果是新增则为空字符串。
 * @property {string | undefined} selectedItemTypeInModal - 弹窗内选中的申请类型ID。
 * @property {() => Promise<void>} handleAddRow - 初始化添加新返利明细的处理函数 (主表单校验通过后打开弹窗)。
 * @property {() => void} handleDeleteRows - 从表格中删除所有选中行的处理函数。
 * @property {(record: RebateItemDetail) => void} handleEditRow - 初始化编辑现有返利明细的处理函数 (使用记录数据打开弹窗)。
 * @property {(key: string, field: keyof RebateItemDetail, value: any) => void} handleTableChange - 表格内编辑的处理函数 (例如，修改数量、价格类型)。
 * @property {() => Promise<void>} handleModalSubmit - 提交明细弹窗表单的处理函数 (添加/更新明细)。
 * @property {() => void} handleModalCancel - 取消/关闭明细弹窗的处理函数。
 * @property {(value: string) => void} handleApplicationTypeChangeInModal - 弹窗内申请类型变化的处理函数。
 * @property {number} totalRebateAmount - 表格中所有明细计算得出的总返利金额。
 */
interface RebateItemManager {
  itemForm: FormInstance<CreateRebateDetailRequestItem>;
  tableData: RebateItemDetail[];
  setTableData: React.Dispatch<React.SetStateAction<RebateItemDetail[]>>;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
  modalVisible: boolean;
  modalLoading: boolean;
  editingKey: string;
  selectedItemTypeInModal: string | undefined; // More specific name
  handleAddRow: () => Promise<void>;
  handleDeleteRows: () => void;
  handleEditRow: (record: RebateItemDetail) => void;
  handleTableChange: (key: string, field: keyof RebateItemDetail, value: any) => void;
  handleModalSubmit: () => Promise<void>;
  handleModalCancel: () => void;
  handleApplicationTypeChangeInModal: (value: string) => void;
  totalRebateAmount: number;
}

/**
 * @function useRebateItemManager
 * @description 用于管理返利明细项目状态和逻辑的自定义 Hook。
 * 包括管理明细表格数据、添加/编辑明细的弹窗、弹窗内的表单处理以及明细金额的计算。
 * @param {UseRebateItemManagerProps} props - Hook 所需的 Props，包括下拉数据和回调函数。
 * @returns {RebateItemManager} 一个包含用于管理返利明细的状态和处理函数的对象。
 */
export function useRebateItemManager({
  priceTypes,
  allBigCategories,
  allMiddleCategories,
  allModels,
  applicationTypes,
  mainForm,
  setFormModified,
  setSelectedModalBigCategoryId,
  setSelectedModalMiddleCategoryId,
}: UseRebateItemManagerProps): RebateItemManager {
  const { message } = App.useApp();
  const [itemForm] = Form.useForm<CreateRebateDetailRequestItem>();

  const [tableData, setTableData] = useState<RebateItemDetail[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [selectedItemTypeInModal, setSelectedItemTypeInModal] = useState<string | undefined>(undefined);

  /**
   * @function calculateItemRebateAmount
   * @description 根据输入的明细项数据计算单项返利金额。
   * @param {Partial<CreateRebateDetailRequestItem>} values - 包含计算所需字段的明细项数据。
   * @returns {number} 计算得出的单项返利金额，四舍五入到两位小数。
   */
  const calculateItemRebateAmount = useCallback((values: Partial<CreateRebateDetailRequestItem>): number => {
    const { applicationTypeId, price = 0, quantity = 0, rebatePrice = 0, rebateRate = 0 } = values;
    let calculatedAmount = 0;
    if (applicationTypeId === 'app-001' && typeof rebatePrice === 'number' && rebatePrice >= 0 && typeof quantity === 'number') {
      calculatedAmount = rebatePrice * quantity;
    } else if (applicationTypeId === 'app-002' && typeof rebateRate === 'number' && rebateRate >= 0 && typeof quantity === 'number' && typeof price === 'number') {
      calculatedAmount = price * quantity * (rebateRate / 100);
    }
    return Math.round(calculatedAmount * 100) / 100;
  }, []);

  /**
   * @function showItemModal
   * @description 打开用于添加或编辑返利明细的弹窗。
   * @param {RebateItemDetail} [record] - (可选) 如果是编辑模式，则为要编辑的明细记录。
   *                                      如果未提供，则为新增模式。
   */
  const showItemModal = useCallback((record?: RebateItemDetail) => {
    itemForm.resetFields(); // 重置弹窗表单
    const defaultAppTypeId = applicationTypes.length > 0 ? applicationTypes[0].id : undefined; // 默认申请类型
    
    if (record) { // 编辑模式
      setEditingKey(record.key);
      setSelectedItemTypeInModal(record.applicationTypeId); 
      itemForm.setFieldsValue({ ...record }); // 回填表单数据
      // 设置弹窗内级联选择的初始状态ID，以触发父组件中 useRebateCascadingLookups 的数据加载
      setSelectedModalBigCategoryId(record.bigCategoryId);
      setSelectedModalMiddleCategoryId(record.middleCategoryId);
    } else { // 新增模式
      setEditingKey(''); // 清空编辑中的Key
      setSelectedItemTypeInModal(defaultAppTypeId); 
      // 清空可能由上次编辑残留的级联选择状态ID
      setSelectedModalBigCategoryId(undefined);
      setSelectedModalMiddleCategoryId(undefined);
      if (defaultAppTypeId) {
        itemForm.setFieldsValue({ // 设置新增时的默认值
          applicationTypeId: defaultAppTypeId,
          quantity: 1,
          // price: 0, // 注意: price（标准单价）通常与型号和价格类型关联。
                       // 如果对于"按返利率"的申请类型，此价格不由用户在弹窗中选择或从其他途径获取，
                       // 则可能需要考虑在此处设置合适的默认值或确保其已被填充。
        });
      }
    }
    setModalVisible(true); // 显示弹窗
  }, [itemForm, applicationTypes, setSelectedModalBigCategoryId, setSelectedModalMiddleCategoryId]);

  /**
   * @function handleAddRow
   * @description 处理添加新返利明细行的操作。
   * 首先会校验主返利申请表单的基本信息是否填写完整。
   */
  const handleAddRow = useCallback(async () => {
    try {
      await mainForm.validateFields();
      showItemModal();
    } catch (error) {
      console.error('基本信息验证失败:', error);
      message.error('请先完成基本信息的必填项');
    }
  }, [mainForm, showItemModal, message]);

  /**
   * @function handleEditRow
   * @description 处理编辑现有返利明细行的操作。
   * @param {RebateItemDetail} record - 要编辑的明细记录。
   */
  const handleEditRow = useCallback((record: RebateItemDetail) => {
    showItemModal(record);
  }, [showItemModal]);

  /**
   * @function handleModalSubmit
   * @description 处理明细弹窗的提交操作。
   * 包括表单校验、计算金额、查找关联名称/代码，然后添加或更新到 `tableData`。
   */
  const handleModalSubmit = useCallback(async () => {
    try {
      setModalLoading(true); // 设置弹窗加载状态
      const values = await itemForm.validateFields() as CreateRebateDetailRequestItem; // 校验并获取弹窗表单值
      const itemRebateAmount = calculateItemRebateAmount(values); // 计算当前明细的返利金额

      // 从传入的完整列表中查找对应的名称/代码，用于表格显示
      const bigCat = allBigCategories.find(c => c.id === values.bigCategoryId);
      const midCat = allMiddleCategories.find(c => c.id === values.middleCategoryId);
      const model = allModels.find(m => m.id === values.modelId);
      const priceType = priceTypes.find(p => p.id === values.priceTypeId);

      // 准备要存入表格的数据结构
      const newItemData: Omit<RebateItemDetail, 'key' | 'itemRebateAmount'> & { itemRebateAmount?: number } = {
        ...values,
        bigCategoryName: bigCat?.name,
        middleCategoryName: midCat?.name,
        modelCode: model?.code,
        priceTypeName: priceType?.name,
      };

      // 最终存入表格的完整明细项
      const finalItem: RebateItemDetail = {
        ...(newItemData as CreateRebateDetailRequestItem), 
        key: editingKey || `item-${Date.now()}`, // 如果是编辑则用原有key，新增则生成新key
        itemRebateAmount: itemRebateAmount, 
      };
      
      if (editingKey) { // 如果是编辑模式
        setTableData(prevData => prevData.map(item => item.key === editingKey ? finalItem : item));
      } else { // 如果是新增模式
        setTableData(prevData => [...prevData, finalItem]);
      }

      setModalVisible(false); // 关闭弹窗
      setEditingKey(''); // 清空编辑状态
      setFormModified(true); // 标记主表单已修改
      message.success(editingKey ? '明细更新成功' : '明细添加成功');
    } catch (error) {
      // 表单校验失败会自动在字段旁显示错误，这里仅记录控制台日志
      console.error('明细表单验证失败:', error);
    } finally {
      setModalLoading(false); // 清除弹窗加载状态
    }
  }, [itemForm, calculateItemRebateAmount, allBigCategories, allMiddleCategories, allModels, priceTypes, editingKey, setFormModified, message]);

  /**
   * @function handleModalCancel
   * @description 处理明细弹窗的取消操作。
   */
  const handleModalCancel = useCallback(() => {
    setModalVisible(false); // 关闭弹窗
    setEditingKey(''); // 清空编辑状态
    // setSelectedModalBigCategoryId(undefined); // 注意: 这些弹窗内的级联选择状态ID (selectedModalBigCategoryId 和 selectedModalMiddleCategoryId)
    // setSelectedModalMiddleCategoryId(undefined); // 在 showItemModal 打开弹窗时会根据是新增还是编辑模式被正确设置或清空，
                                               // 因此在关闭弹窗时，通常不需要在此处再次显式清除它们。
  }, []);

  /**
   * @function handleApplicationTypeChangeInModal
   * @description 处理弹窗内申请类型下拉框变化事件。
   * @param {string} value - 新选中的申请类型ID。
   */
  const handleApplicationTypeChangeInModal = useCallback((value: string) => {
    setSelectedItemTypeInModal(value); // 更新弹窗内选中的申请类型状态
    // 当在弹窗中更改申请类型时，重置相关的字段值
    // 例如: 返利单价/返利率字段。
    // price 字段（标准单价）通常基于型号和价格类型，可能不应在此处重置，或根据具体业务逻辑决定如何处理。
    itemForm.setFieldsValue({ rebatePrice: undefined, rebateRate: undefined, price: itemForm.getFieldValue('price') ?? 0 });
  }, [itemForm]);


  /**
   * @function handleDeleteRows
   * @description 处理删除表格中选中返利明细行的操作。
   */
  const handleDeleteRows = useCallback(() => {
    setTableData(prevData => prevData.filter(item => !selectedRowKeys.includes(item.key)));
    setSelectedRowKeys([]);
    setFormModified(true);
    if (selectedRowKeys.length > 0) {
        message.success('选中明细删除成功');
    }
  }, [selectedRowKeys, setFormModified, message]);

  /**
   * @function handleTableChange
   * @description 处理表格行内编辑事件（例如，修改数量、价格类型等）。
   * @param {string} key - 发生变动的行的Key。
   * @param {keyof RebateItemDetail} field - 发生变动的字段名。
   * @param {any} value - 字段的新值。
   */
  const handleTableChange = useCallback((key: string, field: keyof RebateItemDetail, value: any) => {
    setTableData(prevData =>
      prevData.map(item => {
        if (item.key === key) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'priceTypeId') {
            const selectedType = priceTypes.find(p => p.id === value);
            updatedItem.priceTypeName = selectedType?.name;
          }
          if (['quantity', 'rebatePrice', 'rebateRate', 'price', 'applicationTypeId'].includes(field as string)) {
            updatedItem.itemRebateAmount = calculateItemRebateAmount(updatedItem);
          }
          return updatedItem;
        }
        return item;
      })
    );
    setFormModified(true);
  }, [priceTypes, calculateItemRebateAmount, setFormModified]);

  /**
   * @constant totalRebateAmount
   * @description 使用 useMemo 优化计算的总返利金额。
   * 当 `tableData` 变化时，会重新计算所有明细项的 `itemRebateAmount`之和。
   * @returns {number} 总返利金额，保留两位小数。
   */
  const totalRebateAmount = useMemo(() => {
    return parseFloat(tableData.reduce((sum, item) => sum + (item.itemRebateAmount || 0), 0).toFixed(2));
  }, [tableData]);


  return {
    itemForm,
    tableData,
    setTableData,
    selectedRowKeys,
    setSelectedRowKeys,
    modalVisible,
    modalLoading,
    editingKey,
    selectedItemTypeInModal,
    handleAddRow,
    handleDeleteRows,
    handleEditRow,
    handleTableChange,
    handleModalSubmit,
    handleModalCancel,
    handleApplicationTypeChangeInModal,
    totalRebateAmount,
  };
} 