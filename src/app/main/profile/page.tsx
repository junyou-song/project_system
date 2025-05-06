'use client';
import React from 'react';
import { Card, Avatar, Typography, Tag, Row, Col, Timeline, Progress } from 'antd';
import { UserOutlined, BankOutlined, PhoneOutlined, HomeOutlined, MailOutlined, CodeOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons';
import { personalInfo, education, skills, workExperience, projects, colors } from '@/data/resumeData';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import FadeIn from '@/components/transitions/FadeIn';
import { useNavigation } from '@/hooks/useNavigation';

const { Title, Paragraph, Text } = Typography;

export default function ProfilePage() {
  const { navigateTo } = useNavigation();

  return (
    <>
      {/* 个人信息卡片 */}
      <FadeIn delay={0.1}>
        <Card 
          className="profile-card-hoverable"
          style={{ 
            marginBottom: '24px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          styles={{ body: { padding: '0' } }}
        >
          <div style={{ 
            display: 'flex', 
            position: 'relative',
            padding: '20px'
          }}>
            {/* 大标题区域 - 左侧 */}
            <div style={{ 
              width: '20%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              borderRight: `1px solid ${colors.PRIMARY}20`,
              paddingRight: '20px'
            }}>
              <Title 
                level={1} 
                style={{ 
                  margin: 0, 
                  color: colors.PRIMARY, 
                  fontSize: '36px',
                  fontWeight: 600
                }}
              >
                个人简介
              </Title>
              <Text type="secondary" style={{ fontSize: '16px', marginTop: '8px' }}>
                Personal Resume
              </Text>
              
              <div style={{ marginTop: '16px', width: '80%' }}>
                <div style={{ 
                  width: '100%', 
                  height: '4px', 
                  background: colors.PRIMARY, 
                  borderRadius: '2px',
                  marginBottom: '6px'
                }}></div>
                <div style={{ 
                  width: '70%', 
                  height: '4px', 
                  background: `${colors.PRIMARY}80`, 
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
            
            {/* 个人信息区域 - 右侧 */}
            <div style={{ 
              width: '80%', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '30px'
            }}>
              {/* 背景装饰 */}
              <div style={{ 
                position: 'absolute', 
                right: '60px', 
                top: '10px',
                width: '140px', 
                height: '140px', 
                borderRadius: '70px', 
                background: `${colors.ACCENT}30`,
                zIndex: 0,
                filter: 'blur(2px)'
              }}></div>
              
              <div style={{ zIndex: 1 }}>
                <Title level={2} style={{ margin: 0, color: colors.TEXT_PRIMARY }}>{personalInfo.name}</Title>
                <Title level={4} style={{ margin: '4px 0 12px 0', color: colors.PRIMARY, fontWeight: 400 }}>{personalInfo.title}</Title>
                
                <div style={{ marginBottom: '12px', maxWidth: '450px' }}>
                  <Text type="secondary" style={{ fontSize: '14px', fontStyle: 'italic' }}>
                    善于前端开发与低代码平台应用，专注打造高效、美观、用户友好的界面和系统
                  </Text>
                </div>
                
                <Row gutter={[16, 6]}>
                  <Col span={12}>
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarOutlined style={{ marginRight: 8, color: colors.PRIMARY }} /> 
                      {personalInfo.birth}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneOutlined style={{ marginRight: 8, color: colors.PRIMARY }} /> 
                      {personalInfo.phone}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      <HomeOutlined style={{ marginRight: 8, color: colors.PRIMARY }} /> 
                      {personalInfo.hometown}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text style={{ display: 'flex', alignItems: 'center' }}>
                      <MailOutlined style={{ marginRight: 8, color: colors.PRIMARY }} /> 
                      {personalInfo.email}
                    </Text>
                  </Col>
                </Row>
              </div>
              
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                src="/Information/照片.jpg"
                alt={personalInfo.name}
                style={{ 
                  backgroundColor: colors.PRIMARY,
                  boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
                  zIndex: 1,
                  border: '4px solid white'
                }} 
              />
            </div>
          </div>
        </Card>
      </FadeIn>

      <Row gutter={24}>
        {/* 左侧卡片组 */}
        <Col xs={24} md={8}>
          {/* 教育背景 */}
          <FadeIn delay={0.2} x={-10}>
            <Card 
              title={<div style={{ display: 'flex', alignItems: 'center' }}><BankOutlined style={{ color: colors.PRIMARY, marginRight: 8 }} /> 教育背景</div>} 
              className="profile-card-hoverable"
              style={{ 
                marginBottom: '24px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              styles={{ body: { paddingTop: '8px' } }}
            >
              <Text strong style={{ fontSize: '16px' }}>{education.school}</Text>
              <div style={{ margin: '4px 0 12px' }}>
                <Tag color={colors.PRIMARY}>{education.major}</Tag>
                <Text type="secondary">{education.period}</Text>
              </div>
              <Title level={5}>主修课程</Title>
              <Paragraph style={{ textAlign: 'justify' }}>
                {education.courses.join(', ')}
              </Paragraph>
            </Card>
          </FadeIn>

          {/* 技能 */}
          <FadeIn delay={0.3} x={-10}>
            <Card 
              title={<div style={{ display: 'flex', alignItems: 'center' }}><CodeOutlined style={{ color: colors.PRIMARY, marginRight: 8 }} /> 技术能力</div>} 
              className="profile-card-hoverable"
              style={{ 
                marginBottom: '24px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              styles={{ body: { paddingTop: '8px', flex: 1, display: 'flex', flexDirection: 'column' } }}
            >
              <div style={{ flex: 1 }}>
                <Title level={5}>开发语言</Title>
                <div style={{ marginBottom: '20px' }}>
                  {skills.languages.map((language, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', marginTop: index > 0 ? '12px' : 0 }}>
                        <Text>{language.name}</Text>
                        <Text>{language.proficiency}%</Text>
                      </div>
                      <Progress percent={language.proficiency} showInfo={false} strokeColor={colors.PRIMARY} />
                    </div>
                  ))}
                </div>
                
                <Title level={5}>其他技能</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {skills.tools.map((tool, index) => (
                    <Tag key={index} color={colors.ACCENT} style={{ padding: '4px 8px' }}>{tool}</Tag>
                  ))}
                </div>
                
                <Title level={5}>英语能力</Title>
                <Tag color="blue">{skills.english}</Tag>
              </div>
            </Card>
          </FadeIn>
        </Col>

        {/* 右侧卡片组 */}
        <Col xs={24} md={16}>
          {/* 工作经历 */}
          <FadeIn delay={0.2} x={10}>
            <Card 
              title={<div style={{ display: 'flex', alignItems: 'center' }}><TeamOutlined style={{ color: colors.PRIMARY, marginRight: 8 }} /> 工作经历</div>} 
              className="profile-card-hoverable"
              style={{ 
                marginBottom: '24px', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              styles={{ body: { paddingTop: '8px' } }}
            >
              <Timeline
                items={workExperience.map((work, index) => ({
                  color: colors.PRIMARY,
                  children: (
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: '16px' }}>{work.company}</Text>
                        <Text type="secondary">{work.period}</Text>
                      </div>
                      <div style={{ margin: '4px 0 16px' }}>
                        <Tag color={colors.ACCENT}>{work.position}</Tag>
                      </div>
                      <Paragraph style={{ textAlign: 'justify' }}>
                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                          {work.responsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))}
                        </ul>
                      </Paragraph>
                    </div>
                  ),
                }))}
              />
            </Card>
          </FadeIn>

          {/* 项目经历 */}
          <FadeIn delay={0.3} x={10}>
            <Card 
              title={<div style={{ display: 'flex', alignItems: 'center' }}><TrophyOutlined style={{ color: colors.PRIMARY, marginRight: 8 }} /> 项目经历</div>} 
              className="profile-card-hoverable"
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              styles={{ body: { paddingTop: '8px' } }}
            >
              <Timeline
                items={projects.map((project, index) => ({
                  color: colors.PRIMARY,
                  children: (
                    <div style={{ padding: '8px 0' }}>
                      <Text strong style={{ fontSize: '16px' }}>{project.name} | {project.type}</Text>
                      {project.tag && (
                        <div style={{ margin: '4px 0 12px' }}>
                          <Tag color={project.tagColor || colors.ACCENT}>{project.tag}</Tag>
                        </div>
                      )}
                      {project.tags && (
                        <div style={{ margin: '4px 0 12px' }}>
                          {project.tags.map((tag, index) => (
                            <Tag key={index} color={project.tagsColor || colors.PRIMARY}>{tag}</Tag>
                          ))}
                        </div>
                      )}
                      <Paragraph style={{ textAlign: 'justify', marginBottom: '8px' }}>
                        <Text type="secondary">背景：</Text>{project.background}
                      </Paragraph>
                      <Paragraph style={{ textAlign: 'justify', marginBottom: '8px' }}>
                        <Text type="secondary">实现：</Text>{project.implementation}
                      </Paragraph>
                      <Paragraph style={{ textAlign: 'justify' }}>
                        <Text type="secondary">成果：</Text>{project.results}
                      </Paragraph>
                    </div>
                  ),
                }))}
              />
            </Card>
          </FadeIn>
        </Col>
      </Row>
    </>
  );
}
