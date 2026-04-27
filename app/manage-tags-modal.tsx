import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudentPlan } from '@/hooks/use-student-plan';
import { AppColors, Spacing, FontSizes, Radii, TagColors } from '@/constants/theme';
import { Tag } from '@/constants/types';
import { DEFAULT_TAGS } from '@/constants/mock-data';

const PRESET_COLORS = [
  '#7C6AFF', '#F472B6', '#38BDF8', '#A78BFA', '#4ECDC4',
  '#FB923C', '#FFD166', '#F87171', '#34D399', '#94A3B8',
];

export default function ManageTagsModal() {
  const scheme = useColorScheme() ?? 'dark';
  const colors = AppColors[scheme];
  const router = useRouter();
  const { state, dispatch, getAllTags } = useStudentPlan();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const allTags = getAllTags();

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: `custom_${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      isDefault: false,
    };
    dispatch({ type: 'ADD_TAG', tag });
    setNewTagName('');
    setShowAddForm(false);
  };

  const handleDeleteTag = (tagId: string) => {
    dispatch({ type: 'DELETE_TAG', tagId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Manage Tags</Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tags help you categorize courses in your plan.
        </Text>

        {/* Tag list */}
        <View style={styles.tagList}>
          {allTags.map(tag => (
            <View
              key={tag.id}
              style={[styles.tagItem, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
            >
              <View style={[styles.tagColor, { backgroundColor: tag.color }]} />
              <Text style={[styles.tagName, { color: colors.text }]}>{tag.name}</Text>
              {tag.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.defaultText, { color: colors.textMuted }]}>Default</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleDeleteTag(tag.id)}
                  hitSlop={8}
                  style={[styles.deleteBtn, { backgroundColor: colors.dangerSoft }]}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.danger} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Add new tag */}
        {!showAddForm ? (
          <Pressable
            style={[styles.addToggle, { borderColor: colors.border }]}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
            <Text style={[styles.addToggleText, { color: colors.accent }]}>Add Custom Tag</Text>
          </Pressable>
        ) : (
          <View style={[styles.addForm, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>Tag Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="e.g., Minor Elective"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.formLabel, { color: colors.textMuted }]}>Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map(c => (
                <Pressable
                  key={c}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    newTagColor === c && styles.colorSelected,
                  ]}
                  onPress={() => setNewTagColor(c)}
                >
                  {newTagColor === c && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewRow}>
              <View style={[styles.previewBadge, { backgroundColor: newTagColor + '20', borderColor: newTagColor + '40' }]}>
                <View style={[styles.previewDot, { backgroundColor: newTagColor }]} />
                <Text style={[styles.previewText, { color: newTagColor }]}>
                  {newTagName || 'Preview'}
                </Text>
              </View>
            </View>

            <View style={styles.formActions}>
              <Pressable
                style={[styles.cancelBtn, { backgroundColor: colors.surfaceLight }]}
                onPress={() => { setShowAddForm(false); setNewTagName(''); }}
              >
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, {
                  backgroundColor: newTagName.trim() ? colors.accent : colors.surfaceLight,
                }]}
                onPress={handleAddTag}
                disabled={!newTagName.trim()}
              >
                <Text style={[styles.saveText, {
                  color: newTagName.trim() ? '#FFF' : colors.textMuted,
                }]}>Create Tag</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: '800' },
  subtitle: { fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  tagList: { gap: Spacing.xs, marginBottom: Spacing.lg },
  tagItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: Radii.md, borderWidth: 1,
  },
  tagColor: { width: 20, height: 20, borderRadius: 10 },
  tagName: { fontSize: FontSizes.md, fontWeight: '600', flex: 1 },
  defaultBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full,
  },
  defaultText: { fontSize: FontSizes.xs, fontWeight: '500' },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  addToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radii.md, borderWidth: 1, borderStyle: 'dashed',
  },
  addToggleText: { fontSize: FontSizes.md, fontWeight: '600' },
  addForm: {
    padding: Spacing.lg, borderRadius: Radii.lg, borderWidth: 1,
  },
  formLabel: {
    fontSize: FontSizes.xs, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: Spacing.xs, marginTop: Spacing.sm,
  },
  input: {
    fontSize: FontSizes.md, padding: Spacing.md,
    borderRadius: Radii.md, borderWidth: 1,
  },
  colorRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
  },
  colorOption: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  previewRow: {
    marginTop: Spacing.md, alignItems: 'flex-start',
  },
  previewBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full, borderWidth: 1,
  },
  previewDot: { width: 6, height: 6, borderRadius: 3 },
  previewText: { fontSize: FontSizes.sm, fontWeight: '600' },
  formActions: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  cancelText: { fontSize: FontSizes.md, fontWeight: '600' },
  saveBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  saveText: { fontSize: FontSizes.md, fontWeight: '700' },
});
