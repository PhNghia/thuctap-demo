import { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Alert,
  Collapse,
  Badge,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CategoryIcon from '@mui/icons-material/Category'
import ExtensionIcon from '@mui/icons-material/Extension'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { v4 as uuidv4 } from 'uuid'
import { GroupSortAppData, GroupSortGroup, GroupSortItem } from '../types'
import ImagePicker from './ImagePicker'

interface Props {
  appData: GroupSortAppData
  projectDir: string
  onChange: (data: GroupSortAppData) => void
}

type Tab = 'groups' | 'items'

export default function GroupSortEditor({ appData, projectDir, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('groups')

  const { groups, items } = appData

  // ── Groups CRUD ──────────────────────────────────────────────────────────────
  const addGroup = () => {
    const newGroup: GroupSortGroup = { id: uuidv4(), name: '', imagePath: null }
    onChange({ ...appData, groups: [...groups, newGroup] })
  }

  const updateGroup = useCallback(
    (id: string, patch: Partial<GroupSortGroup>) => {
      onChange({
        ...appData,
        groups: groups.map(g => (g.id === id ? { ...g, ...patch } : g)),
      })
    },
    [appData, groups, onChange]
  )

  const deleteGroup = useCallback(
    (id: string) => {
      onChange({
        // Remove group and unassign any items that were in this group
        groups: groups.filter(g => g.id !== id),
        items: items.map(item => (item.groupId === id ? { ...item, groupId: '' } : item)),
      })
    },
    [appData, groups, items, onChange]
  )

  // ── Items CRUD ───────────────────────────────────────────────────────────────
  const addItem = () => {
    const newItem: GroupSortItem = {
      id: uuidv4(),
      name: '',
      imagePath: null,
      groupId: groups[0]?.id ?? '',
    }
    onChange({ ...appData, items: [...items, newItem] })
  }

  const updateItem = useCallback(
    (id: string, patch: Partial<GroupSortItem>) => {
      onChange({
        ...appData,
        items: items.map(i => (i.id === id ? { ...i, ...patch } : i)),
      })
    },
    [appData, items, onChange]
  )

  const deleteItem = useCallback(
    (id: string) => {
      onChange({ ...appData, items: items.filter(i => i.id !== id) })
    },
    [appData, items, onChange]
  )

  // ── Validation ───────────────────────────────────────────────────────────────
  const unassignedItems = items.filter(i => !i.groupId || !groups.find(g => g.id === i.groupId))
  const unnamedGroups = groups.filter(g => !g.name.trim())
  const unnamedItems = items.filter(i => !i.name.trim())
  const hasIssues = unassignedItems.length > 0 || unnamedGroups.length > 0 || unnamedItems.length > 0

  const itemsPerGroup = groups.map(g => ({
    group: g,
    count: items.filter(i => i.groupId === g.id).length,
  }))

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Left sidebar: tabs + stats ── */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          background: '#13161f',
          p: 2,
          gap: 1,
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.65rem' }}>
          Sections
        </Typography>

        <SidebarTab
          active={tab === 'groups'}
          onClick={() => setTab('groups')}
          icon={<CategoryIcon fontSize="small" />}
          label="Groups"
          badge={groups.length}
          badgeColor={unnamedGroups.length > 0 ? 'error' : 'default'}
        />

        <SidebarTab
          active={tab === 'items'}
          onClick={() => setTab('items')}
          icon={<ExtensionIcon fontSize="small" />}
          label="Items"
          badge={items.length}
          badgeColor={unassignedItems.length > 0 || unnamedItems.length > 0 ? 'error' : 'default'}
        />

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.65rem' }}>
          Distribution
        </Typography>

        {groups.length === 0 ? (
          <Typography variant="caption" color="text.disabled">No groups yet</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {itemsPerGroup.map(({ group, count }) => (
              <Box key={group.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {group.name || '(unnamed)'}
                </Typography>
                <Chip
                  label={count}
                  size="small"
                  sx={{ height: 16, fontSize: '0.65rem', minWidth: 24 }}
                  color={count === 0 ? 'default' : 'primary'}
                />
              </Box>
            ))}
          </Box>
        )}

        {unassignedItems.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              {unassignedItems.length} unassigned
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Validation banner */}
        <Collapse in={hasIssues}>
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 2, fontSize: '0.8rem' }}
          >
            {[
              unnamedGroups.length > 0 && `${unnamedGroups.length} group(s) missing a name`,
              unnamedItems.length > 0 && `${unnamedItems.length} item(s) missing a name`,
              unassignedItems.length > 0 && `${unassignedItems.length} item(s) not assigned to a group`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        {tab === 'groups' && (
          <GroupsTab
            groups={groups}
            projectDir={projectDir}
            onAdd={addGroup}
            onUpdate={updateGroup}
            onDelete={deleteGroup}
          />
        )}

        {tab === 'items' && (
          <ItemsTab
            items={items}
            groups={groups}
            projectDir={projectDir}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
      </Box>
    </Box>
  )
}

// ── Sidebar Tab ───────────────────────────────────────────────────────────────
function SidebarTab({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge: number
  badgeColor: 'default' | 'error' | 'primary'
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        cursor: 'pointer',
        background: active ? 'rgba(110,231,183,0.1)' : 'transparent',
        border: '1px solid',
        borderColor: active ? 'primary.dark' : 'transparent',
        color: active ? 'primary.main' : 'text.secondary',
        transition: 'all 0.15s',
        '&:hover': {
          background: active ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.04)',
          color: active ? 'primary.main' : 'text.primary',
        },
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ flex: 1, fontWeight: active ? 600 : 400 }}>
        {label}
      </Typography>
      <Badge badgeContent={badge} color={badgeColor === 'default' ? 'primary' : badgeColor} max={99}>
        <span />
      </Badge>
    </Box>
  )
}

// ── Groups Tab ────────────────────────────────────────────────────────────────
function GroupsTab({
  groups,
  projectDir,
  onAdd,
  onUpdate,
  onDelete,
}: {
  groups: GroupSortGroup[]
  projectDir: string
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<GroupSortGroup>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6">Groups</Typography>
          <Typography variant="caption" color="text.secondary">
            Each group is a sorting category. Items will be sorted into these groups.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={onAdd}>
          Add Group
        </Button>
      </Box>

      {groups.length === 0 ? (
        <EmptyState
          icon={<CategoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No groups yet"
          description='Click "Add Group" to create your first sorting category.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groups.map((group, idx) => (
            <GroupCard
              key={group.id}
              group={group}
              index={idx}
              projectDir={projectDir}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function GroupCard({
  group,
  index,
  projectDir,
  onUpdate,
  onDelete,
}: {
  group: GroupSortGroup
  index: number
  projectDir: string
  onUpdate: (id: string, patch: Partial<GroupSortGroup>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: '#1a1d27',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.12)' },
      }}
    >
      <Typography
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(110,231,183,0.12)',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Typography>

      <ImagePicker
        projectDir={projectDir}
        value={group.imagePath}
        onChange={path => onUpdate(group.id, { imagePath: path })}
        label="Group image"
        size={72}
      />

      <TextField
        label="Group name"
        value={group.name}
        onChange={e => onUpdate(group.id, { name: e.target.value })}
        placeholder="e.g. Animals, Fruits, Colors…"
        sx={{ flex: 1 }}
        error={!group.name.trim()}
        helperText={!group.name.trim() ? 'Name is required' : ''}
      />

      <Tooltip title="Delete group">
        <IconButton
          size="small"
          onClick={() => onDelete(group.id)}
          sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}

// ── Items Tab ─────────────────────────────────────────────────────────────────
function ItemsTab({
  items,
  groups,
  projectDir,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: GroupSortItem[]
  groups: GroupSortGroup[]
  projectDir: string
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<GroupSortItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6">Items</Typography>
          <Typography variant="caption" color="text.secondary">
            Each item belongs to one group. Students will drag these into the correct group.
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={onAdd}
          disabled={groups.length === 0}
        >
          Add Item
        </Button>
      </Box>

      {groups.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Create at least one group before adding items.
        </Alert>
      )}

      {items.length === 0 && groups.length > 0 ? (
        <EmptyState
          icon={<ExtensionIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No items yet"
          description='Click "Add Item" to create your first sortable card.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              groups={groups}
              projectDir={projectDir}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function ItemCard({
  item,
  index,
  groups,
  projectDir,
  onUpdate,
  onDelete,
}: {
  item: GroupSortItem
  index: number
  groups: GroupSortGroup[]
  projectDir: string
  onUpdate: (id: string, patch: Partial<GroupSortItem>) => void
  onDelete: (id: string) => void
}) {
  const assignedGroup = groups.find(g => g.id === item.groupId)

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: !assignedGroup ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
        borderRadius: 2,
        background: '#1a1d27',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: !assignedGroup ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.12)' },
      }}
    >
      <Typography
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(167,139,250,0.12)',
          color: 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Typography>

      <ImagePicker
        projectDir={projectDir}
        value={item.imagePath}
        onChange={path => onUpdate(item.id, { imagePath: path })}
        label="Item image"
        size={72}
      />

      <TextField
        label="Item name"
        value={item.name}
        onChange={e => onUpdate(item.id, { name: e.target.value })}
        placeholder="e.g. Dog, Apple, Red…"
        sx={{ flex: 1 }}
        error={!item.name.trim()}
        helperText={!item.name.trim() ? 'Name is required' : ''}
      />

      <FormControl size="small" sx={{ minWidth: 160 }} error={!assignedGroup}>
        <InputLabel>Belongs to group</InputLabel>
        <Select
          value={item.groupId}
          label="Belongs to group"
          onChange={e => onUpdate(item.id, { groupId: e.target.value })}
        >
          {groups.length === 0 && (
            <MenuItem value="" disabled>No groups yet</MenuItem>
          )}
          {groups.map(g => (
            <MenuItem key={g.id} value={g.id}>
              {g.name || '(unnamed group)'}
            </MenuItem>
          ))}
        </Select>
        {!assignedGroup && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
            Unassigned
          </Typography>
        )}
      </FormControl>

      <Tooltip title="Delete item">
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 1.5,
        color: 'text.disabled',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 3,
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ opacity: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.4, textAlign: 'center', maxWidth: 320 }}>
        {description}
      </Typography>
    </Box>
  )
}
