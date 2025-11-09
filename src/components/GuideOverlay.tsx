import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { guideBus, GuideEvent } from '../utils/guideBus';
import CalloutBubble from './CalloutBubble';

type Phase = 'idle' | 'msgTop' | 'highlightAddTask' | 'taskTitle' | 'taskNotes' | 'taskCategory' | 'taskPriority' | 'taskRepeat' | 'taskTime' | 'taskSave' | 'highlightAddExpense' | 'waitAmount' | 'done';

export default function GuideOverlay() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');

  const phaseRef = useRef<Phase>('idle');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    return guideBus.on((e: GuideEvent) => {
      if (e.type === 'guide:start' && e.scenario === 'expense') {
        setVisible(true);
        setPhase('highlightAddExpense');
      } else if (e.type === 'guide:startTask') {
        setVisible(true);
        setPhase('msgTop');
        // request precise position for Add Task
        setTimeout(() => guideBus.emit({ type: 'guide:requestAddTaskAnchor' } as any), 0);
      } else if (e.type === 'guide:stop') {
        setVisible(false); setPhase('idle');
      } else if (e.type === 'ui:press:addExpense') {
        setPhase('waitAmount');
      } else if (e.type === 'ui:modal:expense:amountFilled') {
        setPhase('done');
        setTimeout(() => { setVisible(false); setPhase('idle'); }, 800);
      } else if (e.type === 'ui:press:addTask') {
        setAnchors({});
        setPhase('taskTitle');
        // Wait for explicit modal ready signal before requesting anchor
      } else if (e.type === 'task:modalReady' && phaseRef.current === 'taskTitle') {
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:title' } as any), 50);
      } else if (e.type === 'task:titleEntered') {
        setPhase('taskNotes');
        setAnchors((prev)=>({ ...prev, 'task:title': prev['task:title'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:notes' } as any), 100);
      } else if (e.type === 'task:notesTouched') {
        setPhase('taskCategory');
        setAnchors((prev)=>({ ...prev, 'task:notes': prev['task:notes'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:category' } as any), 100);
      } else if (e.type === 'task:categorySelected') {
        setPhase('taskPriority');
        setAnchors((prev)=>({ ...prev, 'task:category': prev['task:category'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:priority' } as any), 100);
      } else if (e.type === 'task:prioritySelected') {
        setPhase('taskRepeat');
        setAnchors((prev)=>({ ...prev, 'task:priority': prev['task:priority'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:repeat' } as any), 100);
      } else if (e.type === 'task:repeatSelected') {
        setPhase('taskTime');
        setAnchors((prev)=>({ ...prev, 'task:repeat': prev['task:repeat'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:time' } as any), 100);
      } else if (e.type === 'task:timeSet') {
        setPhase('taskSave');
        setAnchors((prev)=>({ ...prev, 'task:time': prev['task:time'] }));
        setTimeout(() => guideBus.emit({ type: 'guide:requestAnchor', id: 'task:save' } as any), 100);
      } else if (e.type === 'task:saved') {
        setPhase('done');
        setTimeout(() => { setVisible(false); setPhase('idle'); }, 1200);
      }
    });
  }, []);

  // Track precise anchor rect for Add Task
  const [addTaskRect, setAddTaskRect] = useState<{x:number;y:number;width:number;height:number}|null>(null);
  const [anchors, setAnchors] = useState<Record<string, {x:number;y:number;width:number;height:number}>>({});
  useEffect(() => {
    return guideBus.on((e: any) => {
      if (e.type === 'guide:addTaskAnchor') {
        setAddTaskRect(e.rect);
      } else if (e.type === 'guide:anchor') {
        setAnchors((prev) => ({ ...prev, [e.id]: e.rect }));
      }
    });
  }, []);

  if (!visible) return null;

  const { width } = Dimensions.get('window');

  return (
    <View pointerEvents="box-none" style={{ position:'absolute', left:0, right:0, top:0, bottom:0 }}>
      {/* Dim background */}
      <View pointerEvents="none" style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'rgba(0,0,0,0.45)' }} />

      {/* Center kickoff card */}
      {phase === 'msgTop' && (
        <View style={{ position:'absolute', left:24, right:24, top:'30%', backgroundColor:'#2563EB', borderRadius:16, padding:20, alignItems:'center', shadowColor:'#000', shadowOpacity:0.35, shadowRadius:16, shadowOffset:{width:0,height:8} }}>
          <Text style={{ color:'#FFFFFF', fontWeight:'800', fontSize:18, textAlign:'center', marginBottom:8 }}>Let’s create your first task!</Text>
          <Text style={{ color:'#E9F2FF', textAlign:'center', marginBottom:16 }}>I’ll guide you step by step. Ready?</Text>
          <Pressable onPress={() => setPhase('highlightAddTask')} style={{ backgroundColor:'#0EA5E9', borderRadius:10, paddingVertical:10, paddingHorizontal:18 }}>
            <Text style={{ color:'white', fontWeight:'700' }}>Start</Text>
          </Pressable>
        </View>
      )}

      {/* Bottom helper text for ongoing steps */}
      {phase !== 'msgTop' && (
        <View style={{ position:'absolute', left:24, right:24, top:'45%' }} pointerEvents="none">
          <View style={{ backgroundColor:'#111827e6', borderRadius:16, paddingVertical:16, paddingHorizontal:14 }}>
            <Text style={{ color:'white', fontWeight:'700', fontSize:16, textAlign:'center' }}>
              {phase === 'highlightAddTask' && 'Tap “Add Task” in Quick Access.'}
              {phase === 'taskTitle' && 'Enter a task name (e.g., Buy groceries).'}
              {phase === 'taskNotes' && 'Optional: Add extra details.'}
              {phase === 'taskCategory' && 'Pick a category for your task.'}
              {phase === 'taskPriority' && 'Choose how important this task is.'}
              {phase === 'taskRepeat' && 'Set if and how this task repeats.'}
              {phase === 'taskTime' && 'Choose a time (optional).'}
              {phase === 'taskSave' && 'Tap Save to add your new task!'}
              {phase === 'highlightAddExpense' && 'Tap “Add Expense” to record a purchase.'}
              {phase === 'waitAmount' && 'Enter an amount, then continue. I’ll wait here.'}
              {phase === 'done' && 'Great! You just added an expense.'}
            </Text>
          </View>
        </View>
      )}

      {(phase === 'highlightAddTask') && addTaskRect && (
        <>
          {/* Spotlight ring around Add Task */}
          <View pointerEvents="none" style={{ position:'absolute', left:addTaskRect.x-6, top:addTaskRect.y-6, width:addTaskRect.width+12, height:addTaskRect.height+12, borderRadius:20, borderWidth:3, borderColor:'#60A5FA', shadowColor:'#60A5FA', shadowOpacity:0.6, shadowRadius:12 }} />
          {/* Tooltip above the target */}
          <CalloutBubble text={'Add task'} x={addTaskRect.x + addTaskRect.width/2} y={addTaskRect.y - 8} placement='top' />
        </>
      )}

      {phase === 'highlightAddExpense' && (
        <View pointerEvents="none" style={{ position:'absolute', bottom:180, left:width/2-64, width:128, height:128, borderRadius:24, borderWidth:3, borderColor:'#60A5FA', shadowColor:'#60A5FA', shadowOpacity:0.6, shadowRadius:12 }} />
      )}

      {/* Callouts for task creation steps - only show if we have valid anchors */}
      {phase === 'taskTitle' && anchors['task:title'] && anchors['task:title'].x > 0 && (
        <CalloutBubble text={'Enter title'} x={anchors['task:title'].x + anchors['task:title'].width/2} y={anchors['task:title'].y - 8} placement='top' />
      )}
      {phase === 'taskNotes' && anchors['task:notes'] && anchors['task:notes'].x > 0 && (
        <CalloutBubble text={'Add notes (optional)'} x={anchors['task:notes'].x + anchors['task:notes'].width/2} y={anchors['task:notes'].y - 8} placement='top' />
      )}
      {phase === 'taskCategory' && anchors['task:category'] && anchors['task:category'].x > 0 && (
        <CalloutBubble text={'Pick a category'} x={anchors['task:category'].x + anchors['task:category'].width/2} y={anchors['task:category'].y - 8} placement='top' />
      )}
      {phase === 'taskPriority' && anchors['task:priority'] && anchors['task:priority'].x > 0 && (
        <CalloutBubble text={'Choose priority'} x={anchors['task:priority'].x + anchors['task:priority'].width/2} y={anchors['task:priority'].y - 8} placement='top' />
      )}
      {phase === 'taskRepeat' && anchors['task:repeat'] && anchors['task:repeat'].x > 0 && (
        <CalloutBubble text={'Set repeat'} x={anchors['task:repeat'].x + anchors['task:repeat'].width/2} y={anchors['task:repeat'].y - 8} placement='top' />
      )}
      {phase === 'taskTime' && anchors['task:time'] && anchors['task:time'].x > 0 && (
        <CalloutBubble text={'Select time (optional)'} x={anchors['task:time'].x + anchors['task:time'].width/2} y={anchors['task:time'].y - 8} placement='top' />
      )}
      {phase === 'taskSave' && anchors['task:save'] && anchors['task:save'].x > 0 && (
        <CalloutBubble text={'Tap Save'} x={anchors['task:save'].x + anchors['task:save'].width/2} y={anchors['task:save'].y - 8} placement='top' />
      )}

      <Pressable style={{ position:'absolute', top:40, right:16, paddingVertical:6, paddingHorizontal:10, backgroundColor:'rgba(255,255,255,0.95)', borderRadius:14 }} onPress={() => guideBus.emit({ type:'guide:stop' })}>
        <Text style={{ color:'#111827', fontWeight:'700' }}>Skip</Text>
      </Pressable>
    </View>
  );
}


