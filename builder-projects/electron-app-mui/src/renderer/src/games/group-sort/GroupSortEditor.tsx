import AddIcon from '@mui/icons-material/Add'
import CategoryIcon from '@mui/icons-material/Category'
import DeleteIcon from '@mui/icons-material/Delete'
import ExtensionIcon from '@mui/icons-material/Extension'
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography
} from '@mui/material'
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'
import { useSettings } from '@renderer/hooks/useSettings'
import { MyEditorProps } from '@renderer/types/editor'
import { JSX, useCallback, useState } from 'react'
import {
  EmptyState,
  FileDropTarget,
  IndexBadge,
  NameField,
  SidebarTab,
  StickyHeader
} from '../../components/EditorShared'
import ImagePicker from '../../components/ImagePicker'
import { GroupSortAppData, GroupSortGroup, GroupSortItem } from '../../types'

interface Props extends MyEditorProps<GroupSortAppData> {}

type Tab = 'groups' | 'items' | 'overview'

export default function GroupSortEditor({ form, projectDir }: Props): JSX.Element {
  const data = form.state.values
  const [tab, setTab] = useState<Tab>('groups')
  const { resolved } = useSettings()
  const { groups, items } = data

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  const nextGroupId = useCallback(() => {
    const c = data._groupCounter + 1
    return { id: `group-${c}`, counter: c }
  }, [data._groupCounter])
  const nextItemId = useCallback(() => {
    const c = data._itemCounter + 1
    return { id: `item-${c}`, counter: c }
  }, [data._itemCounter])

  const addGroup = useCallback(
    (initialImage?: string) => {
      const { id, counter } = nextGroupId()
      const g: GroupSortGroup = {
        id,
        name: resolved.prefillNames ? `Group ${counter}` : '',
        imagePath: initialImage ?? null
      }
      form.setFieldValue('groups', (prev) => [...prev, g])
      form.setFieldValue('_groupCounter', counter)
    },
    [form, nextGroupId, resolved.prefillNames]
  )

  const addGroupFromDrop = useCallback(
    async (filePath: string) => {
      const { id, counter } = nextGroupId()
      const imagePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const g: GroupSortGroup = {
        id,
        name: resolved.prefillNames ? `Group ${counter}` : '',
        imagePath
      }
      form.setFieldValue('groups', (prev) => [...prev, g])
      form.setFieldValue('_groupCounter', counter)
    },
    [form, nextGroupId, projectDir, resolved.prefillNames]
  )

  const deleteGroup = useCallback(
    (id: string) => {
      form.setFieldValue('groups', (prev) => prev.filter((g) => g.id !== id))
      form.setFieldValue('items', (prev) =>
        prev.map((i) => (i.groupId === id ? { ...i, groupId: '' } : i))
      )
    },
    [form]
  )

  // groupId defaults to the last group (or first as fallback for empty)
  const addItem = useCallback(
    (groupId?: string, initialImage?: string) => {
      const { id, counter } = nextItemId()
      const targetGroupId = groupId ?? groups[groups.length - 1]?.id ?? ''
      const i: GroupSortItem = {
        id,
        name: resolved.prefillNames ? `Item ${counter}` : '',
        imagePath: initialImage ?? null,
        groupId: targetGroupId
      }
      form.setFieldValue('items', (prev) => [...prev, i])
      form.setFieldValue('_itemCounter', counter)
    },
    [form, groups, nextItemId, resolved.prefillNames]
  )

  const addItemFromDrop = useCallback(
    async (filePath: string, groupId?: string) => {
      const { id, counter } = nextItemId()
      const imagePath = await window.electronAPI.importImage(filePath, projectDir, id)
      const targetGroupId = groupId ?? groups[groups.length - 1]?.id ?? ''
      const i: GroupSortItem = {
        id,
        name: resolved.prefillNames ? `Item ${counter}` : '',
        imagePath,
        groupId: targetGroupId
      }
      form.setFieldValue('items', (prev) => [...prev, i])
      form.setFieldValue('_itemCounter', counter)
    },
    [form, groups, nextItemId, projectDir, resolved.prefillNames]
  )

  const deleteItem = useCallback(
    (id: string) => {
      form.setFieldValue('items', (prev) => prev.filter((i) => i.id !== id))
    },
    [form]
  )

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // Tier 1 (Ctrl+N) = item (smallest unit) → last group
  // Tier 2 (Ctrl+Shift+N) = group (nothing above group)
  useEntityCreateShortcut({
    onTier1: addItem,
    onTier2: addGroup
  })

  // ── Validation ────────────────────────────────────────────────────────────
  const unassigned = items.filter((i) => !i.groupId || !groups.find((g) => g.id === i.groupId))
  const unnamedG = groups.filter((g) => !g.name.trim())
  const unnamedI = items.filter((i) => !i.name.trim())
  const hasIssues = unassigned.length > 0 || unnamedG.length > 0 || unnamedI.length > 0
  const itemsPerGroup = groups.map((g) => ({
    group: g,
    count: items.filter((i) => i.groupId === g.id).length
  }))

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          background: '#13161f',
          p: 2,
          gap: 1
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
        >
          Sections
        </Typography>
        <SidebarTab
          active={tab === 'groups'}
          onClick={() => setTab('groups')}
          icon={<CategoryIcon fontSize="small" />}
          label="Groups"
          badge={groups.length}
          badgeColor={unnamedG.length > 0 ? 'error' : 'default'}
        />
        <SidebarTab
          active={tab === 'items'}
          onClick={() => setTab('items')}
          icon={<ExtensionIcon fontSize="small" />}
          label="Items"
          badge={items.length}
          badgeColor={unassigned.length > 0 || unnamedI.length > 0 ? 'error' : 'default'}
        />
        <SidebarTab
          active={tab === 'overview'}
          onClick={() => setTab('overview')}
          icon={<ViewQuiltIcon fontSize="small" />}
          label="Overview"
          badge={groups.length + items.length}
          badgeColor={hasIssues ? 'error' : 'default'}
        />

        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2, fontSize: '0.65rem' }}
        >
          Distribution
        </Typography>
        {groups.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            No groups yet
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {itemsPerGroup.map(({ group, count }) => (
              <Box
                key={group.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
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
        {unassigned.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            <Typography variant="caption" color="warning.main">
              {unassigned.length} unassigned
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Collapse in={hasIssues}>
          <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {[
              unnamedG.length > 0 && `${unnamedG.length} group(s) missing a name`,
              unnamedI.length > 0 && `${unnamedI.length} item(s) missing a name`,
              unassigned.length > 0 && `${unassigned.length} item(s) not assigned to a group`
            ]
              .filter(Boolean)
              .join(' · ')}
          </Alert>
        </Collapse>

        {tab === 'groups' && (
          <GroupsTab
            form={form}
            groups={groups}
            projectDir={projectDir}
            onAdd={addGroup}
            onAddFromDrop={addGroupFromDrop}
            onDelete={deleteGroup}
          />
        )}
        {tab === 'items' && (
          <ItemsTab
            form={form}
            items={items}
            groups={groups}
            projectDir={projectDir}
            onAdd={addItem}
            onAddFromDrop={addItemFromDrop}
            onDelete={deleteItem}
          />
        )}
        {tab === 'overview' && (
          <OverviewTab
            form={form}
            groups={groups}
            items={items}
            projectDir={projectDir}
            onAddGroup={addGroup}
            onAddGroupFromDrop={addGroupFromDrop}
            onAddItem={addItem}
            onAddItemFromDrop={addItemFromDrop}
            onDeleteGroup={deleteGroup}
            onDeleteItem={deleteItem}
            unassigned={unassigned}
          />
        )}
      </Box>
    </Box>
  )
}

// ── Groups Tab ────────────────────────────────────────────────────────────────
function GroupsTab({
  form,
  groups,
  projectDir,
  onAdd,
  onAddFromDrop,
  onDelete
}: {
  form: Props['form']
  groups: GroupSortGroup[]
  projectDir: string
  onAdd: () => void
  onAddFromDrop: (fp: string) => void
  onDelete: (id: string) => void
}): JSX.Element {
  return (
    <Box>
      <StickyHeader
        title="Groups"
        description="Each group is a sorting category. Items will be sorted into these groups."
        actions={
          <FileDropTarget onFileDrop={onAddFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAdd()}
            >
              Add Group
            </Button>
          </FileDropTarget>
        }
      />
      {groups.length === 0 ? (
        <EmptyState
          icon={<CategoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No groups yet"
          description='Click "Add Group" or drop an image on the button to create a category.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groups.map((g, idx) => (
            <GroupCard
              key={g.id}
              form={form}
              group={g}
              index={idx}
              projectDir={projectDir}
              onDelete={onDelete}
              autoFocus={idx === groups.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function GroupCard({
  form,
  group,
  index,
  projectDir,
  onDelete,
  autoFocus
}: {
  form: Props['form']
  group: GroupSortGroup
  index: number
  projectDir: string
  autoFocus?: boolean
  onDelete: (id: string) => void
}): JSX.Element {
  return (
    <FileDropTarget
      onFileDrop={async (fp) => {
        const rel = await window.electronAPI.importImage(fp, projectDir, group.id)
        form.setFieldValue(`groups[${index}].imagePath`, rel)
      }}
    >
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
          '&:hover': { borderColor: 'rgba(255,255,255,0.12)' }
        }}
      >
        <IndexBadge index={index} color="primary" />
        <form.Field
          name={`groups[${index}].imagePath`}
          children={(field) => (
            <ImagePicker
              projectDir={projectDir}
              desiredNamePrefix={group.id}
              value={field.state.value}
              onChange={field.handleChange}
              label="Group image"
              size={72}
            />
          )}
        />
        <form.Field
          name={`groups[${index}].name`}
          children={(field) => (
            <NameField
              label="Group name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. Animals, Fruits, Colors…"
              autoFocus={autoFocus}
            />
          )}
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
    </FileDropTarget>
  )
}

// ── Items Tab ─────────────────────────────────────────────────────────────────
function ItemsTab({
  form,
  items,
  groups,
  projectDir,
  onAdd,
  onAddFromDrop,
  onDelete
}: {
  form: Props['form']
  items: GroupSortItem[]
  groups: GroupSortGroup[]
  projectDir: string
  onAdd: (groupId?: string) => void
  onAddFromDrop: (fp: string) => void
  onDelete: (id: string) => void
}): JSX.Element {
  return (
    <Box>
      <StickyHeader
        title="Items"
        description="Each item belongs to one group. Students will drag these into the correct group."
        actions={
          <FileDropTarget onFileDrop={onAddFromDrop}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => onAdd()}
              disabled={groups.length === 0}
            >
              Add Item
            </Button>
          </FileDropTarget>
        }
      />
      {groups.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Create at least one group before adding items.
        </Alert>
      )}
      {items.length === 0 && groups.length > 0 ? (
        <EmptyState
          icon={<ExtensionIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="No items yet"
          description='Click "Add Item" or drop an image on the button to create a card.'
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, idx) => (
            <ItemCard
              key={item.id}
              form={form}
              item={item}
              index={idx}
              groups={groups}
              projectDir={projectDir}
              onDelete={onDelete}
              autoFocus={idx === items.length - 1}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

function ItemCard({
  form,
  item,
  index,
  groups,
  projectDir,
  onDelete,
  autoFocus
}: {
  form: Props['form']
  item: GroupSortItem
  index: number
  groups: GroupSortGroup[]
  projectDir: string
  autoFocus?: boolean
  onDelete: (id: string) => void
}): JSX.Element {
  const assigned = groups.find((g) => g.id === item.groupId)
  return (
    <FileDropTarget
      onFileDrop={async (fp) => {
        const rel = await window.electronAPI.importImage(fp, projectDir, item.id)
        form.setFieldValue(`items[${index}].imagePath`, rel)
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          border: '1px solid',
          borderColor: !assigned ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          background: '#1a1d27',
          transition: 'border-color 0.15s',
          '&:hover': { borderColor: !assigned ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.12)' }
        }}
      >
        <IndexBadge index={index} color="secondary" />
        <form.Field
          name={`items[${index}].imagePath`}
          children={(field) => (
            <ImagePicker
              projectDir={projectDir}
              desiredNamePrefix={item.id}
              value={field.state.value}
              onChange={field.handleChange}
              label="Item image"
              size={72}
            />
          )}
        />
        <form.Field
          name={`items[${index}].name`}
          children={(field) => (
            <NameField
              label="Item name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. Dog, Apple, Red…"
              autoFocus={autoFocus}
            />
          )}
        />
        <form.Field
          name={`items[${index}].groupId`}
          children={(field) => (
            <FormControl size="small" sx={{ minWidth: 160 }} error={!assigned}>
              <InputLabel>Belongs to group</InputLabel>
              <Select
                value={field.state.value}
                label="Belongs to group"
                onChange={(e) => field.handleChange(e.target.value as string)}
                onBlur={field.handleBlur}
              >
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name || '(unnamed)'}
                  </MenuItem>
                ))}
              </Select>
              {!assigned && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ mt: 0.5, fontSize: '0.65rem' }}
                >
                  Unassigned
                </Typography>
              )}
            </FormControl>
          )}
        />
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
    </FileDropTarget>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({
  form,
  groups,
  items,
  projectDir,
  onAddGroup,
  onAddGroupFromDrop,
  onAddItem,
  onAddItemFromDrop,
  onDeleteGroup,
  onDeleteItem,
  unassigned
}: {
  form: Props['form']
  groups: GroupSortGroup[]
  items: GroupSortItem[]
  projectDir: string
  unassigned: GroupSortItem[]
  onAddGroup: () => void
  onAddGroupFromDrop: (fp: string) => void
  onAddItem: (gid?: string) => void
  onAddItemFromDrop: (fp: string, gid?: string) => void
  onDeleteGroup: (id: string) => void
  onDeleteItem: (id: string) => void
}): JSX.Element {
  // "Add Item" in the header → last group
  const lastGroupId = groups[groups.length - 1]?.id

  return (
    <Box>
      <StickyHeader
        title="Overview"
        description="All groups and their items at a glance."
        actions={
          <>
            <FileDropTarget onFileDrop={onAddGroupFromDrop}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => onAddGroup()}
              >
                Add Group
              </Button>
            </FileDropTarget>
            <FileDropTarget onFileDrop={(fp) => onAddItemFromDrop(fp, lastGroupId)}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={() => onAddItem(lastGroupId)}
                disabled={groups.length === 0}
              >
                Add Item
              </Button>
            </FileDropTarget>
          </>
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={<ViewQuiltIcon sx={{ fontSize: 48, opacity: 0.3 }} />}
          title="Nothing here yet"
          description="Add groups first, then populate them with items."
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {groups.map((group, gIdx) => {
            const gItems = items.filter((i) => i.groupId === group.id)
            return (
              <Box key={group.id}>
                <FileDropTarget
                  onFileDrop={async (fp) => {
                    const rel = await window.electronAPI.importImage(fp, projectDir, group.id)
                    form.setFieldValue(`groups[${gIdx}].imagePath`, rel)
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '1px solid rgba(110,231,183,0.2)',
                      borderRadius: 2,
                      background: 'rgba(110,231,183,0.04)',
                      mb: 1
                    }}
                  >
                    <IndexBadge index={gIdx} color="primary" />
                    <form.Field
                      name={`groups[${gIdx}].imagePath`}
                      children={(field) => (
                        <ImagePicker
                          projectDir={projectDir}
                          desiredNamePrefix={group.id}
                          value={field.state.value}
                          onChange={field.handleChange}
                          label="Image"
                          size={56}
                        />
                      )}
                    />
                    <form.Field
                      name={`groups[${gIdx}].name`}
                      children={(field) => (
                        <NameField
                          label="Group name"
                          value={field.state.value}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                          placeholder="Group name…"
                        />
                      )}
                    />
                    <Chip
                      label={`${gItems.length} item${gItems.length !== 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    <FileDropTarget onFileDrop={(fp) => onAddItemFromDrop(fp, group.id)}>
                      <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => onAddItem(group.id)}
                      >
                        Add Item
                      </Button>
                    </FileDropTarget>
                    <Tooltip title="Delete group">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteGroup(group.id)}
                        sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </FileDropTarget>

                {gItems.length === 0 ? (
                  <Box
                    sx={{
                      ml: 4,
                      py: 1.5,
                      px: 2,
                      borderRadius: 1.5,
                      border: '1px dashed rgba(255,255,255,0.06)',
                      color: 'text.disabled'
                    }}
                  >
                    <Typography variant="caption">
                      No items yet — click Add Item above, or drop an image on it
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {gItems.map((item) => {
                      const itemIdx = items.findIndex((i) => i.id === item.id)
                      return (
                        <FileDropTarget
                          key={item.id}
                          onFileDrop={async (fp) => {
                            const rel = await window.electronAPI.importImage(
                              fp,
                              projectDir,
                              item.id
                            )
                            form.setFieldValue(`items[${itemIdx}].imagePath`, rel)
                          }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 2,
                              background: '#1a1d27'
                            }}
                          >
                            <form.Field
                              name={`items[${itemIdx}].imagePath`}
                              children={(field) => (
                                <ImagePicker
                                  projectDir={projectDir}
                                  desiredNamePrefix={item.id}
                                  value={field.state.value}
                                  onChange={field.handleChange}
                                  label="Image"
                                  size={52}
                                />
                              )}
                            />
                            <form.Field
                              name={`items[${itemIdx}].name`}
                              children={(field) => (
                                <NameField
                                  label="Item name"
                                  value={field.state.value}
                                  onChange={field.handleChange}
                                  onBlur={field.handleBlur}
                                  placeholder="Item name…"
                                />
                              )}
                            />
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => onDeleteItem(item.id)}
                                sx={{
                                  color: 'error.main',
                                  opacity: 0.6,
                                  '&:hover': { opacity: 1 }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Paper>
                        </FileDropTarget>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )
          })}

          {unassigned.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                  Unassigned items ({unassigned.length})
                </Typography>
              </Box>
              <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {unassigned.map((item) => {
                  const itemIdx = items.findIndex((i) => i.id === item.id)
                  return (
                    <FileDropTarget
                      key={item.id}
                      onFileDrop={async (fp) => {
                        const rel = await window.electronAPI.importImage(fp, projectDir, item.id)
                        form.setFieldValue(`items[${itemIdx}].imagePath`, rel)
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          border: '1px solid rgba(251,191,36,0.3)',
                          borderRadius: 2,
                          background: '#1a1d27'
                        }}
                      >
                        <form.Field
                          name={`items[${itemIdx}].imagePath`}
                          children={(field) => (
                            <ImagePicker
                              projectDir={projectDir}
                              desiredNamePrefix={item.id}
                              value={field.state.value}
                              onChange={field.handleChange}
                              label="Image"
                              size={52}
                            />
                          )}
                        />
                        <form.Field
                          name={`items[${itemIdx}].name`}
                          children={(field) => (
                            <NameField
                              label="Item name"
                              value={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              placeholder="Item name…"
                            />
                          )}
                        />
                        <form.Field
                          name={`items[${itemIdx}].groupId`}
                          children={(field) => (
                            <FormControl size="small" sx={{ minWidth: 140 }} error>
                              <InputLabel>Assign to group</InputLabel>
                              <Select
                                value={field.state.value}
                                label="Assign to group"
                                onChange={(e) => field.handleChange(e.target.value as string)}
                                onBlur={field.handleBlur}
                              >
                                {groups.map((g) => (
                                  <MenuItem key={g.id} value={g.id}>
                                    {g.name || '(unnamed)'}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteItem(item.id)}
                            sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    </FileDropTarget>
                  )
                })}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
