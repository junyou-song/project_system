// 简历数据集中管理文件

// 个人基本信息
export const personalInfo = {
  name: '宋俊佑',
  title: '前端开发工程师',
  birth: '2003年3月',
  phone: '17302232710',
  hometown: '广西省桂林市',
  email: 'sjy1471857092@163.com'
};

// 教育背景
export const education = {
  school: '天津师范大学',
  major: '物联网工程',
  period: '2021.09-2025.06',
  courses: [
    'C语言程序设计', '操作系统', '数据结构', '数据库原理', 
    '软件工程', '安卓应用开发', '计算机网络', '大数据与云计算', 
    '计算机组成原理', '电路原理', '嵌入式系统设计与应用', '物联网系统设计'
  ]
};

// 技术能力
export const skills = {
  languages: [
    { name: 'React', proficiency: 90 },
    { name: 'TypeScript', proficiency: 85 },
    { name: 'HTML/CSS', proficiency: 90 },
    { name: 'Python', proficiency: 75 }
  ],
  tools: ['Cursor', 'Trae', 'Git'],
  english: '四级'
};

// 工作经历
export const workExperience = [
  {
    company: '上海微钉科技',
    position: '交付部实习生',
    period: '2024.07-至今',
    responsibilities: [
      '主导/参与5个B端系统开发 (供应链返利模块/合同管理/任务平台等)，独立开发 Canvas App 动态表单&审批流程，通过 SharePoint 列表构建数据模型，基于 Power Platform 实现端到端交付 (需求分析→上线)，平均交付周期3周。',
      '深入应用前端技术栈，使用 React、TypeScript 及 Antd Design 结合 PCF (Power Apps Component Framework) 开发高复用前端控件 (如数据导入导出、表单打印等)，有效突破低代码平台交互限制，并高效完成多个项目表单打印功能的开发 (如: 2天内完成5个复杂页面)。'
    ]
  }
];

// 项目经历
export const projects = [
  {
    name: '海尔返利模块',
    type: 'Power Platform全栈开发',
    tag: '制造业500强',
    tagColor: '#F7B733', // DEEP_MUSTARD_YELLOW
    background: '客户使用传统Excel手工计算供应商返利，涉及63个不同计算公式和200+个产品类别，手工计算错误率高达15%，每月耗时3天，缺乏审批流程和历史追溯，且数据分散在多个系统中难以管理。',
    implementation: '主导设计并开发基于Power Platform的返利管理系统，技术要点包括：(1)使用Power Fx实现63个复杂计算公式的自动化；(2)设计多维数据模型，使用SharePoint列表构建关系型数据存储；(3)开发自定义React组件处理批量数据导入导出，突破平台限制；(4)实现基于角色的多级审批流程，集成Power Automate自动化审批通知；(5)设计并实现数据校验机制，确保数据一致性。',
    results: '项目成果显著：返利计算错误率从15%降至0，处理周期从3天缩短至4小时(提效85%)，实现了数据全流程可追溯，每年节省财务人力成本约40万元。系统上线后获客户高度评价，被推广至集团3个业务部门使用，作为数字化转型标杆项目。'
  },
  {
    name: '电装任务平台',
    type: 'Power Platform全栈开发',
    tag: '独立交付',
    tagColor: 'green',
    background: '客户使用Excel表格和纸质工单管理800+员工的任务分配和进度跟踪，导致任务状态更新滞后(平均延迟2天)，管理者无法实时掌握任务进度，跨部门协作效率低下，员工参与度不足，缺乏激励机制。',
    implementation: '独立设计并开发任务管理平台，核心技术实现包括：(1)基于Canvas App构建响应式界面，实现PC/移动端自适应；(2)使用PCF框架自定义开发React组件，实现任务看板与拖拽功能；(3)设计任务积分算法，结合任务复杂度、紧急度和完成质量自动计算积分；(4)开发基于Power BI的实时数据分析仪表盘，可视化部门和个人绩效；(5)使用微信企业号API集成，实现任务变更实时推送；(6)实现完整的积分兑换和激励体系。',
    results: '系统上线后绩效显著：任务响应时间从平均4小时缩短至30分钟，员工参与度提升40%，跨部门协作效率提升65%，管理层决策效率提升50%。该项目被客户评为年度最佳数字化项目，并获得了集团层面30万元的额外预算支持，用于系统功能扩展。'
  },
  {
    name: '维益请假审批系统',
    type: 'Power Platform全栈开发',
    tag: '流程优化',
    tagColor: '#1677ff',
    background: '客户HR部门每月处理500+请假申请，使用纸质流程需经3个部门8个审批节点，整个流程平均耗时2天，HR需手动将请假数据录入5个不同系统(SAP、考勤系统等)，数据同步错误率达12%，频繁的数据不一致导致薪资计算错误。',
    implementation: '负责系统架构设计与核心功能实现：(1)基于SharePoint设计规范化数据模型，实现与SAP、考勤系统的双向数据集成；(2)使用Power Automate构建智能审批流，根据请假类型和时长动态确定审批路径；(3)开发自定义TypeScript控件处理日期计算和冲突检测；(4)实现并发控制机制，解决多人同时编辑导致的数据冲突；(5)开发移动端自适应界面，支持随时随地提交和审批；(6)设计数据同步机制，确保跨系统数据一致性。',
    results: '系统实现了显著业务价值：审批周期从2天减少至2小时(提效75%)，完全消除了数据同步错误，HR数据处理效率提升80%，每年节省人力成本约15万元。该系统被集团总部评为最佳实践，并推广至集团下属5家公司使用，服务员工超过2000人。'
  },
  {
    name: '多系统表单打印功能',
    type: '前端组件开发',
    tags: ['React', 'TypeScript', 'Antd Design'],
    tagsColor: 'blue',
    background: '客户8个业务系统使用不同的打印实现方式，导致打印样式不一致，用户体验差，且难以支持复杂动态表单的精确打印。特别是包含动态表格、自定义图表和电子签名的表单无法正确打印，客户每月因打印问题接到约45个用户投诉。',
    implementation: '负责打印模块架构设计与开发：(1)使用React、TypeScript和Antd Design设计高复用的打印组件库；(2)实现基于CSS Grid的精确布局系统，确保打印与屏幕显示一致；(3)开发自定义Hook管理复杂打印状态和预览逻辑；(4)设计适配器模式处理不同数据源格式；(5)实现虚拟滚动优化大数据量表格渲染性能；(6)开发HTML转PDF引擎，支持批量打印与电子存档；(7)结合Claude和GitHub Copilot加速开发，实现代码自动生成与优化。',
    results: '在仅2周内完成了8个系统共37个打印模板的重构，其中包含15个复杂页面。打印准确率达到100%，用户投诉减少95%，打印性能提升60%，特别是在处理超过1000行数据的报表时。该组件库成为公司标准前端资产，并被应用到后续所有项目中，极大提升了开发效率和系统一致性。'
  }
];

// 新的配色方案 A
export const colors = {
  PRIMARY: '#1677ff',         // 主色 - Ant Design 蓝
  ACCENT: '#8c8c8c',          // 强调色/辅助色 - 中灰色 (可按需调整)
  TEXT_PRIMARY: '#333333',    // 主要文字 - 深灰色
  TEXT_SECONDARY: '#8c8c8c',   // 次要文字 - 中灰色
  BACKGROUND: '#F5F5F5',       // 整体背景 - 布局背景灰
  CONTAINER_BG: '#FFFFFF',    // 容器背景 - 白色
  BORDER: '#f0f0f0',          // 边框/分割线 - 浅灰色
  WHITE_TEXT: '#FFFFFF',       // 白色文字
  SUCCESS: '#52c41a',         // 成功色 (Ant Design Green)
  WARNING: '#faad14',         // 警告色 (Ant Design Yellow)
  ERROR: '#f5222d',           // 错误色 (Ant Design Red)
  // 移除旧颜色
  // SKY_BLUE: '#1CB9ED',
  // DARK_GREY: '#4A4A4A',
  // DEEP_MUSTARD_YELLOW: '#F7B733',
  // LIGHT_GREY: '#F3F4F6'
}; 