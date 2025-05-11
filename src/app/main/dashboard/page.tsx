'use client';
import React from 'react';
import { Typography, Card, Row, Col, Space, Tag, Avatar, Input, Button } from 'antd';
import { 
  SearchOutlined,
  BarChartOutlined,
  CalendarOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import FadeIn from '@/components/transitions/FadeIn';
import { useNavigation } from '@/hooks/useNavigation';

const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { navigateTo, navigateWithConfirm } = useNavigation();

  return (
    <div className="dashboard-container">
      <FadeIn>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>仪表盘</Title>
            <Paragraph style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
              查看了100个国家中的10个
            </Paragraph>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Input
              placeholder="搜索..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: 240, borderRadius: 8 }}
            />
          </div>
        </div>
      </FadeIn>
      
      {/* 业绩概览部分 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <FadeIn delay={0.1}>
            <Card 
              title="业绩概览" 
              variant="borderless"
              extra={<Button type="text" style={{ color: '#1677ff' }}>导出</Button>}
              style={{ height: '100%', borderRadius: 12 }}
              styles={{body:{padding: '24px 24px 0'}}}
            >
              {/* 假设这里有个图表组件 */}
              <div style={{ 
                height: 200, 
                background: 'linear-gradient(180deg, rgba(228, 177, 254, 0.2) 0%, rgba(228, 177, 254, 0) 100%)',
                borderRadius: 12,
                position: 'relative',
                marginBottom: 24
              }}>
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '60%', 
                    background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23e4b1fe\' fill-opacity=\'0.5\' d=\'M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom', 
                    backgroundSize: 'cover' 
                  }}
                />
              </div>
              
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <FadeIn delay={0.2} y={10}>
                    <Card 
                      style={{ 
                        borderRadius: 12, 
                        background: '#f5f5f5',
                        border: 'none'
                      }}
                      styles={{body:{padding: '16px'}}}
                    >
                      <Space>
                        <Avatar 
                          style={{ 
                            backgroundColor: '#e6f4ff', 
                            color: '#1677ff',
                            fontSize: 18
                          }}
                          icon={<EyeOutlined />}
                        />
                        <div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>浏览量</div>
                          <div style={{ fontWeight: 'bold', fontSize: 20 }}>20,751</div>
                        </div>
                      </Space>
                    </Card>
                  </FadeIn>
                </Col>
                <Col span={12}>
                  <FadeIn delay={0.3} y={10}>
                    <Card 
                      style={{ 
                        borderRadius: 12, 
                        background: '#f5f5f5',
                        border: 'none'
                      }}
                      styles={{body:{padding: 16}}}
                    >
                      <Space>
                        <Avatar 
                          style={{ 
                            backgroundColor: '#e6f7ff', 
                            color: '#1890ff',
                            fontSize: 18
                          }}
                          icon={<BarChartOutlined />}
                        />
                        <div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>销售额</div>
                          <div style={{ fontWeight: 'bold', fontSize: 20 }}>2,564</div>
                        </div>
                      </Space>
                    </Card>
                  </FadeIn>
                </Col>
              </Row>
            </Card>
          </FadeIn>
        </Col>
        
        <Col xs={24} lg={8}>
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <FadeIn delay={0.2} x={10}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: 'linear-gradient(135deg, #2979ff 0%, #1890ff 100%)', 
                    color: 'white',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}
                  styles={{body:{padding: 24}}}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                      <ClockCircleOutlined style={{ fontSize: 80 }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>等待处理</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 32, fontWeight: 'bold' }}>840</span>
                      <Tag style={{ marginLeft: 8, background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white' }}>
                        <ArrowUpOutlined /> +15
                      </Tag>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Avatar.Group maxCount={3} size="small">
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=3" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=4" />
                      </Avatar.Group>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            </Col>
            
            <Col span={24}>
              <FadeIn delay={0.3} x={10}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: 'linear-gradient(135deg, #b64aff 0%, #e4b1fe 100%)', 
                    color: 'white',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}
                  styles={{body:{padding: 24}}}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                      <CheckCircleOutlined style={{ fontSize: 80 }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>已完成任务</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 32, fontWeight: 'bold' }}>235</span>
                      <Tag style={{ marginLeft: 8, background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white' }}>
                        <ArrowUpOutlined /> +12
                      </Tag>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Avatar.Group maxCount={3} size="small">
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=5" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=6" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=7" />
                      </Avatar.Group>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            </Col>
            
            <Col span={24}>
              <FadeIn delay={0.4} x={10}>
                <Card 
                  variant="borderless"
                  style={{ 
                    background: 'linear-gradient(135deg, #0d1d34 0%, #1a2a42 100%)', 
                    color: 'white',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}
                  styles={{body:{padding: 24}}}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                      <DollarOutlined style={{ fontSize: 80 }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: 8 }}>总收入</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 32, fontWeight: 'bold' }}>$2m</span>
                      <Tag style={{ marginLeft: 8, background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: 'white' }}>
                        <ArrowUpOutlined /> +0.5
                      </Tag>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Avatar.Group maxCount={3} size="small">
                        <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                        <Avatar style={{ backgroundColor: '#87d068' }}>L</Avatar>
                        <Avatar style={{ backgroundColor: '#1890ff' }}>M</Avatar>
                      </Avatar.Group>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            </Col>
          </Row>
        </Col>
      </Row>
      
      {/* 所有预订部分 */}
      <FadeIn delay={0.3}>
        <Card 
          title="所有预订" 
          variant="borderless"
          style={{ marginTop: 24, borderRadius: 12 }}
          extra={
            <Space>
              <Button type="default" icon={<CalendarOutlined />}>
                月份 <span style={{ opacity: 0.5 }}>▼</span>
              </Button>
            </Space>
          }
        >
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <Button style={{ borderRadius: 8 }}>
              出发日期 <span style={{ opacity: 0.5 }}>▼</span>
            </Button>
            <Button style={{ borderRadius: 8 }}>
              预订类型 <span style={{ opacity: 0.5 }}>▼</span>
            </Button>
            <Button style={{ borderRadius: 8 }}>
              日期范围 <span style={{ opacity: 0.5 }}>▼</span>
            </Button>
          </div>
          
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#8c8c8c' }}>
                  <th style={{ padding: '12px 16px' }}>目的地</th>
                  <th style={{ padding: '12px 16px' }}>日期</th>
                  <th style={{ padding: '12px 16px' }}>人员</th>
                </tr>
              </thead>
              <tbody>
                <FadeIn delay={0.4} y={10}>
                  <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Avatar style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }}>S</Avatar>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>06:00</div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>上海</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#8c8c8c', margin: '0 16px' }}>
                          <div style={{ height: 1, width: 80, background: '#1890ff', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', color: '#1890ff', fontSize: 12 }}>
                              2h 30m
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>08:30</div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>北京</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>2023年11月02日</td>
                    <td style={{ padding: '16px' }}>
                      <Avatar.Group>
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />
                        <Avatar style={{ backgroundColor: '#1890ff' }}>+2</Avatar>
                      </Avatar.Group>
                    </td>
                  </tr>
                </FadeIn>
                <FadeIn delay={0.5} y={10}>
                  <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Avatar style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}>L</Avatar>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>20:00</div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>深圳</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#8c8c8c', margin: '0 16px' }}>
                          <div style={{ height: 1, width: 80, background: '#722ed1', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', color: '#722ed1', fontSize: 12 }}>
                              3h 30m
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>23:30</div>
                          <div style={{ color: '#8c8c8c', fontSize: 14 }}>广州</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>2023年11月01日</td>
                    <td style={{ padding: '16px' }}>
                      <Avatar.Group>
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
                        <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=9" />
                      </Avatar.Group>
                    </td>
                  </tr>
                </FadeIn>
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
      
      {/* 底部卡片区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <FadeIn delay={0.4}>
            <Card 
              title="活动日历" 
              variant="borderless"
              extra={<Button type="primary" icon={<PlusOutlined />}>添加计划</Button>}
              style={{ borderRadius: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ color: '#8c8c8c' }}>2023年11月02日</div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: 24 }}>
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => (
                  <div key={index} style={{ width: '14%' }}>
                    <div style={{ color: '#8c8c8c', marginBottom: 8 }}>{day}</div>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      margin: '0 auto', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: index === 3 ? '#1890ff' : 'transparent',
                      color: index === 3 ? 'white' : 'inherit'
                    }}>
                      {14 + index}
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <FadeIn delay={0.5} y={10}>
                  <div style={{ display: 'flex', marginBottom: 16 }}>
                    <div style={{ width: 80, textAlign: 'right', paddingRight: 16, color: '#8c8c8c' }}>07:00</div>
                    <div 
                      style={{ 
                        flex: 1, 
                        background: 'rgba(24, 144, 255, 0.1)', 
                        padding: 16, 
                        borderRadius: 8,
                        borderLeft: '4px solid #1890ff'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>上海</div>
                      <div style={{ color: '#8c8c8c' }}>行前准备</div>
                    </div>
                  </div>
                </FadeIn>
                
                <FadeIn delay={0.6} y={10}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 80, textAlign: 'right', paddingRight: 16, color: '#8c8c8c' }}>08:00</div>
                    <div 
                      style={{ 
                        flex: 1, 
                        background: 'rgba(245, 176, 0, 0.1)', 
                        padding: 16, 
                        borderRadius: 8,
                        borderLeft: '4px solid #f5b000'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>北京</div>
                      <div style={{ color: '#8c8c8c' }}>登记手续已完成</div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </Card>
          </FadeIn>
        </Col>
        
        <Col xs={24} lg={8}>
          <FadeIn delay={0.5} x={10}>
            <Card 
              variant="borderless"
              style={{ 
                background: 'linear-gradient(135deg, #061e3f 0%, #164989 100%)', 
                color: 'white',
                borderRadius: 12,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              styles={{body:{padding: 24, flex: 1, display: 'flex', flexDirection: 'column'}}}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ marginBottom: 24 }}>
                  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 10L110 90H10L60 10Z" fill="rgba(255, 255, 255, 0.1)" />
                    <path d="M60 30L85 70H35L60 30Z" fill="rgba(255, 255, 255, 0.2)" />
                  </svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>升级您的计划</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: 24 }}>获取高级功能！</div>
                <Button 
                  type="primary" 
                  style={{ 
                    background: 'white', 
                    color: '#1890ff',
                    borderRadius: 20,
                    height: 40,
                    padding: '0 24px'
                  }}
                >
                  立即升级
                </Button>
              </div>
            </Card>
          </FadeIn>
        </Col>
      </Row>
    </div>
  );
}
