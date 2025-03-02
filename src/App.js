import './App.css';
import React from 'react';
import { Button } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Demo from './demo';

const App = () => {
  // 智能体分组数据
  const agentGroups = [
    {
      name: '   教学智能体',
      agents: [
        '研究所智能体教学秘书',
        '课程智能体助教',
        '教师智能体助教',
        '学生智能体学伴'
      ]
    },
    {
      name: '   科研智能体',
      agents: [
        '研究院智能体科研秘书',
        '教师智能体科研助手', 
        '学生智能体研伴'
      ]
    },
    {
      name: '   行政智能体',
      agents: [
        '职能部门智能体秘书',
        '领导智能体秘书',
        '职员智能体助手'
      ]
    }
  ];

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="outer-container"> {/* 第一层容器：大标题和 A1 */}
              <div className="header-container">
                <h2>欢迎使用浙江大学光华法学院智能体助教！</h2>
              </div>
              <div className="inner-container"> {/* 第二层容器：A1 */}
                {agentGroups.map((group, index) => (
                  <div 
                    key={index}
                    className={`module-container ${['teaching', 'research', 'admin'][index]}`}
                  >
                    <h3>{group.name}</h3>
                    {group.agents.map((agent, i) => (
                      <Button 
                        type="link" 
                        key={`${index}-${i}`}
                      >
                        <Link to={`/demo/${encodeURIComponent(agent)}`}>
                          {agent}
                        </Link>
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <Route path="/demo/:agent" element={<Demo />} />
      </Routes>
    </Router>
  );
};

export default App;
