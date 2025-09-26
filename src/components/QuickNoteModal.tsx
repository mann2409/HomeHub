import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { Note, NoteCategory } from "../types";
import useNoteStore from "../state/noteStore";

interface QuickNoteModalProps {
  visible: boolean;
  onClose: () => void;
  note?: Note | null;
}

export default function QuickNoteModal({ visible, onClose, note }: QuickNoteModalProps) {
  const { addNote, updateNote, deleteNote, togglePin } = useNoteStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("personal");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content);
      setCategory(note.category);
      setTags(note.tags?.join(", ") || "");
      setPinned(note.pinned);
    }
  }, [note]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("personal");
    setTags("");
    setPinned(false);
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const tagsList = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (isEditing && note) {
      updateNote(note.id, {
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        tags: tagsList.length > 0 ? tagsList : undefined,
        pinned,
      });
    } else {
      addNote({
        title: title.trim() || undefined,
        content: content.trim(),
        category,
        tags: tagsList.length > 0 ? tagsList : undefined,
        pinned,
      });
    }

    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!note) return;
    
    deleteNote(note.id);
    resetForm();
    onClose();
  };

  const handleTogglePin = () => {
    if (!note) return;
    
    togglePin(note.id);
    setPinned(!pinned);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEditing ? "Edit Note" : "Quick Note"}
      size="md"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Input
          label="Title (Optional)"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter note title"
        />

        <Input
          label="Content"
          value={content}
          onChangeText={setContent}
          placeholder="What's on your mind?"
          multiline
          numberOfLines={6}
          autoFocus={!isEditing}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Category
          </Text>
          <View className="bg-gray-50 border border-gray-200 rounded-lg">
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value as NoteCategory)}
            >
              <Picker.Item label="Personal" value="personal" />
              <Picker.Item label="Work" value="work" />
              <Picker.Item label="Ideas" value="ideas" />
              <Picker.Item label="Reminders" value="reminders" />
              <Picker.Item label="Shopping" value="shopping" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <Input
          label="Tags (Optional)"
          value={tags}
          onChangeText={setTags}
          placeholder="tag1, tag2, tag3"
          helperText="Separate tags with commas"
        />

        {isEditing && (
          <View className="mb-4">
            <Button
              title={pinned ? "Unpin Note" : "Pin Note"}
              variant="outline"
              onPress={handleTogglePin}
              className="mb-2"
            />
          </View>
        )}

        <View className="flex-row mb-4">
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            className="flex-1 mr-3"
          />
          <Button
            title={isEditing ? "Save Changes" : "Save Note"}
            onPress={handleSave}
            disabled={!content.trim()}
            className="flex-1"
          />
        </View>

        {isEditing && (
          <Button
            title="Delete Note"
            variant="outline"
            onPress={handleDelete}
            className="border-red-200 bg-red-50"
            textClassName="text-red-600"
          />
        )}
      </ScrollView>
    </Modal>
  );
}