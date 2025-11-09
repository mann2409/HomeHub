import React, { useState, useEffect, useRef } from "react";
import { ScrollView, Keyboard, Platform, View, Text, Pressable, InteractionManager } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "./Modal";
import Input from "./Input";
import PrioritySelector from "./PrioritySelector";
import CategorySelector from "./CategorySelector";
import RepeatSelector from "./RepeatSelector";
import Toast from "./Toast";
import { TaskCategory, Priority, RecurrenceRule } from "../types";
import useTaskStore from "../state/taskStore";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { guideBus } from "../utils/guideBus";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export default function AddTaskModal({ visible, onClose, initialDate }: AddTaskModalProps) {
  const { addTask } = useTaskStore();
  const isIOS = Platform.OS === 'ios';
  const { showAd, isLoaded } = isIOS ? useInterstitialAd() : { showAd: () => {}, isLoaded: false } as any;

  const tryShowInterstitial = () => {
    if (!isIOS) return;
    // Try immediately if loaded
    if (isLoaded) {
      showAd();
      return;
    }
    // Otherwise, wait briefly for load (up to ~5s)
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts += 1;
      if (isLoaded) {
        clearInterval(interval);
        try {
          // Ensure all animations/transitions (modal dismiss) are completed
          InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
              try { showAd(); } catch {}
            }, 50);
          });
        } catch {}
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  };
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState(initialDate || new Date());
  const [recurring, setRecurring] = useState<RecurrenceRule | undefined>(undefined);
  const [time, setTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const notesEventSent = useRef(false);

  // Anchor refs for guided bubbles
  const refTitle = useRef<View>(null);
  const refNotes = useRef<View>(null);
  const refCategory = useRef<View>(null);
  const refPriority = useRef<View>(null);
  const refRepeat = useRef<View>(null);
  const refTime = useRef<View>(null);
  const refSave = useRef<View>(null);

  // Listen for guide anchor requests and emit measurements
  useEffect(() => {
    const unsub = guideBus.on((e: any) => {
      if (e.type === 'guide:requestAnchor') {
        const map: Record<string, React.RefObject<View>> = {
          'task:title': refTitle,
          'task:notes': refNotes,
          'task:category': refCategory,
          'task:priority': refPriority,
          'task:repeat': refRepeat,
          'task:time': refTime,
          'task:save': refSave,
        };
        const r = map[e.id];
        if (r?.current && (r.current as any).measureInWindow) {
          (r.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
            guideBus.emit({ type: 'guide:anchor', id: e.id, rect: { x, y, width, height } } as any);
          });
        }
      }
    });
    return unsub;
  }, []);

  // Emit notes touched when user starts typing notes
  useEffect(() => {
    if (!notesEventSent.current && description !== "") {
      notesEventSent.current = true;
      guideBus.emit({ type: 'task:notesTouched' });
    }
  }, [description]);

  // Auto-focus management
  useEffect(() => {
    if (visible) {
      // Clear any previous errors when modal opens
      setTitleError("");
      // Notify guide overlay that modal is ready so it can request anchors
      setTimeout(() => guideBus.emit({ type: 'task:modalReady' } as any), 0);
    }
  }, [visible]);

  // Keep dueDate in sync with the selected date from the calendar when opening
  useEffect(() => {
    if (visible) {
      setDueDate(initialDate || new Date());
    }
  }, [initialDate, visible]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("personal");
    setPriority("medium");
    setDueDate(initialDate || new Date());
    setRecurring(undefined);
    setTime(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setTitleError("Task title is required");
      return false;
    }
    if (title.trim().length > 100) {
      setTitleError("Task title must be less than 100 characters");
      return false;
    }
    setTitleError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Combine selected date with optional time
      const combinedDueDate = (() => {
        if (!dueDate) return undefined;
        if (!time) return dueDate;
        const d = new Date(dueDate);
        d.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return d;
      })();

      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        dueDate: combinedDueDate,
        category,
        priority,
        recurring,
      });

      resetForm();
      onClose();
      // Show an interstitial at a natural breakpoint after task creation
      // Give iOS time to finish dismissing the modal before presenting the ad
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          tryShowInterstitial();
        });
      }, 1200);
      
      // Show success feedback
      setToastMessage("Task created successfully!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to create task. Please try again.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        onClose={handleClose}
        title="New Task"
        navigationMode={true}
        leftButton={{
          title: "Cancel",
          onPress: handleClose,
        }}
        rightButton={{
          title: "Save",
          onPress: () => { handleSave(); guideBus.emit({ type:'task:saved' }); },
          disabled: !title.trim() || isLoading,
          loading: isLoading,
        }}
      >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View ref={refTitle}>
          <Input
            label="Title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError("");
              if (text.trim().length > 0) {
                guideBus.emit({ type: 'task:titleEntered' });
              }
            }}
            placeholder="Task title"
            autoFocus
            required
            maxLength={100}
            showCharacterCount
            error={titleError}
            keyboardType="default"
            returnKeyType="next"
          />
        </View>

        <View ref={refNotes}>
          <Input
            label="Notes"
            value={description}
            onChangeText={setDescription}
            placeholder="Add notes..."
            multiline
            numberOfLines={3}
            maxLength={500}
            showCharacterCount
            textAlignVertical="top"
          />
        </View>

        <View ref={refCategory}>
          <CategorySelector
            value={category}
            onChange={(v)=>{ setCategory(v); guideBus.emit({ type:'task:categorySelected' }); }}
          />
        </View>

        <View ref={refPriority}>
          <PrioritySelector
            value={priority}
            onChange={(v)=>{ setPriority(v); guideBus.emit({ type:'task:prioritySelected' }); }}
          />
        </View>

        <View ref={refRepeat}>
          <RepeatSelector
            value={recurring}
            onChange={(v)=>{ setRecurring(v); guideBus.emit({ type:'task:repeatSelected' }); }}
          />
        </View>

        {/* Time selection */}
        <View className="mt-3" ref={refTime}>
          <Text className="text-white/80 mb-2">Time (optional)</Text>
          <Pressable
            onPress={() => { setShowTimePicker(true); }}
            className="py-3 px-4 rounded-lg border border-white/20 bg-white/5"
          >
            <Text className="text-white">
              {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select time'}
            </Text>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={time || dueDate || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              {...(Platform.OS === 'ios' ? { textColor: '#FFFFFF' } : {})}
              onChange={(event: any, selected?: Date) => {
                if (Platform.OS !== 'ios') setShowTimePicker(false);
                if (event.type === 'dismissed') return;
                if (selected) {
                  const picked = new Date(selected);
                  picked.setSeconds(0, 0);
                  setTime(picked);
                  guideBus.emit({ type:'task:timeSet' });
                }
              }}
              onTouchCancel={() => setShowTimePicker(false)}
            />
          )}
        </View>
      </ScrollView>
      </Modal>

      <View ref={refSave} style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 40 }} />

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </>
  );
}