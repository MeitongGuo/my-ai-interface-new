/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import { Button, Space } from 'antd';
import { EllipsisOutlined, FireOutlined, PaperClipOutlined, PlusOutlined, ShareAltOutlined } from '@ant-design/icons';

const useStyle = createStyles(({ token, css }) => ({
  layout: css`
    width: 100%;
    min-width: 1000px;
    height: 722px;
    border-radius: ${token.borderRadius}px;
    display: flex;
    background: ${token.colorBgContainer};
    font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
  `,
  menu: css`
    background: ${token.colorBgLayout}80;
    width: 280px;
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  chat: css`
    height: 100%;
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: ${token.paddingLG}px;
    gap: 16px;
  `,
  messages: css`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  `,
  sender: css`
    box-shadow: ${token.boxShadow};
  `,
  logo: css`
    display: flex;
    height: 72px;
    align-items: center;
    justify-content: start;
    padding: 0 24px;
    box-sizing: border-box;
  `,
  addBtn: css`
    background: #1677ff0f;
    border: 1px solid #1677ff34;
    width: calc(100% - 24px);
    margin: 0 12px 24px 12px;
  `,
  loadingDot: css`
    @keyframes dot-flashing {
      0% { opacity: 0.2 }
      50% { opacity: 1 }
      100% { opacity: 0.2 }
    }
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 0 2px;
    background: ${token.colorText};
    border-radius: 50%;
    animation: dot-flashing 1.4s infinite linear;
  `
}));

const Independent = () => {
  const { styles } = useStyle();

  // 使用更清晰的状态结构
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([
    { key: '0', label: '我的对话', messages: [] }
  ]);
  const [activeKey, setActiveKey] = useState('0');
  // eslint-disable-next-line
  const [attachedFiles, setAttachedFiles] = useState([]);

  const apiUrl = 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions';
  const agentId = 'riHARZzq7sAa';
  const token = 'ae4TeTBiCIDSjebEEivMW2QikiuV5eck';
  const userId = '18636502087';

  // 安全的消息流处理函数
  // 修改后的流式更新函数
const handleStreamUpdate = async (aiMsgId, aiMessage) => {
  const CHUNK_SIZE = 5; // 每5个字符更新一次
  const BASE_DELAY = 30; // 固定间隔时间

  let currentContent = '';
  const chars = aiMessage.split('');
  let chunkBuffer = [];
  
  const updateContent = () => {
    currentContent += chunkBuffer.join('');
    chunkBuffer = [];
    setMessages(prev => 
      prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, content: currentContent, status: 'success' }
          : msg
      )
    );
  };

  for (let i = 0; i < chars.length; i++) {
    chunkBuffer.push(chars[i]);
    
    if (chunkBuffer.length >= CHUNK_SIZE || i === chars.length - 1) {
      await new Promise(resolve => 
        setTimeout(() => {
          updateContent();
          resolve();
        }, BASE_DELAY)
      );
    }
  }

  // 最终同步保证完整性
  setMessages(prev => 
    prev.map(msg => 
      msg.id === aiMsgId 
        ? { ...msg, content: aiMessage, status: 'success' }
        : msg
    )
  );
};

  const handleSendMessage = async (message) => {
    if (!message) return;

    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: message,
        status: 'success',
        timestamp: Date.now()
      },
      {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        status: 'loading',
        timestamp: Date.now()
      }
    ]);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'X-Source': 'openapi',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assistant_id: agentId,
          user_id: userId,
          stream: false,
          messages: [{
            role: 'user',
            content: [{
              type: 'text',
              text: message,
            }],
          }],
        }),
      });

      const data = await response.json();
      const aiMessage = data?.choices?.[0]?.message?.content || '';
      
      await handleStreamUpdate(aiMsgId, aiMessage);
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, content: `错误: ${error.message}`, status: 'error' }
            : msg
        )
      );
    }
  };

  // 修复依赖项
  useEffect(() => {
    const currentConv = conversations.find(c => c.key === activeKey);
    setMessages(currentConv?.messages || []);
  }, [activeKey, conversations]);

  const handleNewConversation = () => {
    const newKey = String(conversations.length);
    setConversations(prev => [
      ...prev,
      { key: newKey, label: `对话 ${newKey}`, messages: [] }
    ]);
    setActiveKey(newKey);
  };

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <Welcome
          variant="borderless"
          icon="https://picture.gptkong.com/20250302/1720936895a2f043cabbad7ce67a92d171.jpg"
          title="这里是您的智能体助教"
          description="通过充分利用AI技术，提升教学、科研和行政管理等多方面的智能化水平"
          extra={
            <Space>
              <Button icon={<ShareAltOutlined />} />
              <Button icon={<EllipsisOutlined />} />
            </Space>
          }
        />
      );
    }

    return (
      <Bubble.List
        items={messages.map(msg => ({
          key: msg.id,
          role: msg.role,
          content: msg.status === 'loading' ? (
            <Space>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </Space>
          ) : msg.content,
          className: msg.status === 'error' ? 'error-message' : '',
        }))}
        roles={{
          user: { placement: 'end' },
          assistant: { placement: 'start' }
        }}
      />
    );
  };

  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        <Button
          onClick={handleNewConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          开启新对话
        </Button>
        <Conversations
          items={conversations}
          activeKey={activeKey}
          onActiveChange={setActiveKey}
        />
      </div>
      
      <div className={styles.chat}>
        <div className={styles.messages}>
          {renderMessages()}
        </div>

        <Prompts
          items={[{ key: '1', description: '常见问题', icon: <FireOutlined /> }]}
          onItemClick={(item) => handleSendMessage(item.data.description)}
        />

        <Sender
          value={content}
          onSubmit={(value) => {
            handleSendMessage(value);
            setContent('');
          }}
          onChange={setContent}
          prefix={
            <Badge dot={attachedFiles.length > 0}>
              <Button 
                type="text" 
                icon={<PaperClipOutlined />} 
                onClick={() => {/* 附件逻辑 */}}
              />
            </Badge>
          }
        />
      </div>
    </div>
  );
};

export default Independent;
