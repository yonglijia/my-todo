import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Divider, Button, Spin, Input, Modal, ColorPicker, Select } from 'antd';
import {
  InboxOutlined, CalendarOutlined, StarOutlined, CheckCircleOutlined, SettingOutlined, PlusOutlined,
  HomeOutlined, BookOutlined, HeartOutlined, ShopOutlined, CarOutlined,
  CreditCardOutlined, GiftOutlined, TrophyOutlined, TeamOutlined, RocketOutlined, BulbOutlined,
  CloudOutlined, CoffeeOutlined, ExperimentOutlined, FireOutlined, GlobalOutlined, FlagOutlined,
  FundOutlined, KeyOutlined, LikeOutlined, MedicineBoxOutlined, PhoneOutlined, PrinterOutlined,
  SafetyOutlined, SoundOutlined, ThunderboltOutlined, ToolOutlined, WalletOutlined, EnvironmentOutlined,
  FolderOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import { TodoList, Tag } from '../types';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

interface SidebarProps {
  onClose?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

// 可选图标列表
const iconOptions = [
  { value: 'HomeOutlined', label: '🏠 首页', icon: HomeOutlined },
  { value: 'ShopOutlined', label: '🛒 购物', icon: ShopOutlined },
  { value: 'BookOutlined', label: '📚 学习', icon: BookOutlined },
  { value: 'HeartOutlined', label: '❤️ 生活', icon: HeartOutlined },
  { value: 'CarOutlined', label: '🚗 出行', icon: CarOutlined },
  { value: 'CreditCardOutlined', label: '💳 财务', icon: CreditCardOutlined },
  { value: 'GiftOutlined', label: '🎁 礼物', icon: GiftOutlined },
  { value: 'TrophyOutlined', label: '🏆 目标', icon: TrophyOutlined },
  { value: 'TeamOutlined', label: '👥 团队', icon: TeamOutlined },
  { value: 'RocketOutlined', label: '🚀 项目', icon: RocketOutlined },
  { value: 'BulbOutlined', label: '💡 想法', icon: BulbOutlined },
  { value: 'CloudOutlined', label: '☁️ 云端', icon: CloudOutlined },
  { value: 'CoffeeOutlined', label: '☕ 咖啡', icon: CoffeeOutlined },
  { value: 'ExperimentOutlined', label: '🧪 实验', icon: ExperimentOutlined },
  { value: 'FireOutlined', label: '🔥 重要', icon: FireOutlined },
  { value: 'GlobalOutlined', label: '🌍 全球', icon: GlobalOutlined },
  { value: 'FlagOutlined', label: '🚩 里程碑', icon: FlagOutlined },
  { value: 'FundOutlined', label: '📊 数据', icon: FundOutlined },
  { value: 'KeyOutlined', label: '🔑 密钥', icon: KeyOutlined },
  { value: 'LikeOutlined', label: '👍 喜欢', icon: LikeOutlined },
  { value: 'MedicineBoxOutlined', label: '💊 健康', icon: MedicineBoxOutlined },
  { value: 'PhoneOutlined', label: '📞 电话', icon: PhoneOutlined },
  { value: 'PrinterOutlined', label: '🖨️ 打印', icon: PrinterOutlined },
  { value: 'SafetyOutlined', label: '🛡️ 安全', icon: SafetyOutlined },
  { value: 'SoundOutlined', label: '🔊 音乐', icon: SoundOutlined },
  { value: 'ThunderboltOutlined', label: '⚡ 快速', icon: ThunderboltOutlined },
  { value: 'ToolOutlined', label: '🔧 工具', icon: ToolOutlined },
  { value: 'WalletOutlined', label: '👛 钱包', icon: WalletOutlined },
  { value: 'EnvironmentOutlined', label: '📍 地点', icon: EnvironmentOutlined },
];

const getIconComponent = (iconName?: string) => {
  if (!iconName) return FolderOutlined;
  const found = iconOptions.find(opt => opt.value === iconName);
  return found ? found.icon : FolderOutlined;
};

// 图标选择器组件
const IconSelector: React.FC<{
  value?: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <Select
      value={value || 'HomeOutlined'}
      onChange={onChange}
      style={{ width: '100%' }}
      optionLabelProp="label"
      placeholder="选择图标"
    >
      {iconOptions.map(opt => (
        <Select.Option key={opt.value} value={opt.value} label={opt.label.split(' ')[0]}>
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onToggleSidebar, sidebarOpen = true }) => {
  const location = useLocation();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // 新建清单
  const [listModalOpen, setListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#1677ff');
  const [newListIcon, setNewListIcon] = useState('HomeOutlined');

  // 新建标签
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetchListsAndTags();
  }, []);

  const fetchListsAndTags = async () => {
    try {
      setLoading(true);
      const [listsRes, tagsRes] = await Promise.all([
        apiClient.getLists(),
        apiClient.getTags(),
      ]);
      if (listsRes.success && listsRes.data) {
        setLists(listsRes.data);
      }
      if (tagsRes.success && tagsRes.data) {
        setTags(tagsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch lists and tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('请输入清单名称');
      return;
    }
    const response = await apiClient.createList(newListName.trim(), newListColor);
    if (response.success && response.data) {
      // 更新清单图标（需要在后端支持）
      setLists([...lists, { ...response.data, icon: newListIcon }]);
      setListModalOpen(false);
      setNewListName('');
      setNewListColor('#1677ff');
      setNewListIcon('HomeOutlined');
      toast.success('清单已创建');
    } else {
      toast.error(response.error || '创建失败');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('请输入标签名称');
      return;
    }
    const response = await apiClient.createTag(newTagName.trim(), '#f5222d');
    if (response.success && response.data) {
      setTags([...tags, response.data]);
      setTagModalOpen(false);
      setNewTagName('');
      toast.success('标签已创建');
    } else {
      toast.error(response.error || '创建失败');
    }
  };

  const menuItems = [
    { icon: InboxOutlined, label: '收集箱', path: '/' },
    { icon: CalendarOutlined, label: '今天', path: '/today' },
    { icon: StarOutlined, label: '明天', path: '/tomorrow' },
    { icon: CheckCircleOutlined, label: '已完成', path: '/completed' },
  ];

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px' }}>
        <div style={{ padding: '0 12px 8px', fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>
          任务
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={menuItems.map(item => ({
            key: item.path,
            icon: <item.icon />,
            label: <Link to={item.path}>{item.label}</Link>,
          }))}
        />
      </div>

      <div 
        className="sidebar-scrollable" 
        style={{ 
          padding: '12px', 
          flex: 1, 
          overflowY: 'auto',
          paddingRight: '8px',
          marginRight: '-8px',
        }}
      >
        {/* 清单标题和加号在一行 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 12px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>清单</span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setListModalOpen(true)}
            style={{ padding: '4px', color: '#bfbfbf' }}
          />
        </div>
        {lists.length > 0 && (
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ border: 'none', marginBottom: '8px' }}
            items={lists.map(list => {
              const IconComponent = getIconComponent((list as any).icon);
              return {
                key: `/list/${list.id}`,
                icon: <IconComponent style={{ color: list.color }} />,
                label: <Link to={`/list/${list.id}`}>{list.name}</Link>,
              };
            })}
          />
        )}


        <Divider style={{ margin: '12px 0' }} />

        {/* 标签标题和加号在一行 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 12px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase' }}>标签</span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setTagModalOpen(true)}
            style={{ padding: '4px', color: '#bfbfbf' }}
          />
        </div>
        {tags.length > 0 && (
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ border: 'none', marginBottom: '8px' }}
            items={tags.map(tag => ({
              key: `/tag/${tag.id}`,
              icon: <span style={{ color: '#f5222d', fontWeight: 600 }}>#</span>,
              label: <Link to={`/tag/${tag.id}`}>{tag.name}</Link>,
            }))}
          />
        )}
      </div>

      <div style={{ 
        padding: '12px', 
        borderTop: '1px solid #f0f0f0', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        overflow: 'hidden',
        minWidth: '0',
      }}>
        <div style={{ overflow: 'hidden', minWidth: '0' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ border: 'none', width: '100%', overflow: 'hidden' }}
            items={[
              {
                key: '/settings',
                icon: <SettingOutlined />,
                label: <Link to="/settings">设置</Link>,
              },
            ]}
          />
        </div>
        {onToggleSidebar && (
          <Button
            type="text"
            block
            icon={sidebarOpen ? <LeftOutlined /> : <RightOutlined />}
            onClick={onToggleSidebar}
            style={{
              textAlign: 'left',
              color: '#8c8c8c',
              padding: '4px 12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {sidebarOpen ? '收起' : '展开'}
          </Button>
        )}
      </div>

      {/* 新建清单弹窗 */}
      <Modal
        title="新建清单"
        open={listModalOpen}
        onCancel={() => setListModalOpen(false)}
        onOk={handleCreateList}
        okText="创建"
        cancelText="取消"
        centered
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>名称</div>
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="输入清单名称"
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>图标</div>
          <IconSelector value={newListIcon} onChange={setNewListIcon} />
        </div>
        <div>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>颜色</div>
          <ColorPicker
            value={newListColor}
            onChange={(_, hex) => setNewListColor(hex)}
            presets={[
              {
                label: '推荐',
                colors: ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2', '#fa541c'],
              },
            ]}
          />
        </div>
      </Modal>

      {/* 新建标签弹窗 - 简化版 */}
      <Modal
        title="新建标签"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        onOk={handleCreateTag}
        okText="创建"
        cancelText="取消"
        centered
        width={360}
      >
        <div>
          <div style={{ marginBottom: 8, color: '#8c8c8c' }}>名称</div>
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="输入标签名称"
            autoFocus
            prefix={<span style={{ color: '#f5222d' }}>#</span>}
          />
          <div style={{ marginTop: 8, color: '#bfbfbf', fontSize: 12 }}>
            标签将以 # 号和浅红色统一标识
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sidebar;
