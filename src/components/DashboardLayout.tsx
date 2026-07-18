import React, { useState } from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripHorizontal } from 'lucide-react';

const WidgetItem: React.FC<{ id: string, widget: { id: string, component: React.ReactNode, title: string } }> = ({ id, widget }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={id}
      className="group relative list-none"
      dragListener={false}
      dragControls={controls}
    >
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-grab active:cursor-grabbing bg-slate-800 rounded-full p-2 border border-slate-700 shadow-xl flex items-center justify-center hover:bg-slate-700 hover:scale-110"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        style={{ touchAction: "none" }}
      >
        <GripHorizontal className="w-5 h-5 text-slate-300" />
      </div>
      
      {widget.component}
    </Reorder.Item>
  );
};

export const DashboardLayout = ({ widgets }: { widgets: { id: string, component: React.ReactNode, title: string }[] }) => {
  const [order, setOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('swiftpay_widget_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currentIds = widgets.map(w => w.id);
        const completeOrder = [...new Set([...parsed, ...currentIds])].filter(id => currentIds.includes(id));
        return completeOrder;
      } catch (e) {}
    }
    return widgets.map(w => w.id);
  });

  const handleReorder = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('swiftpay_widget_order', JSON.stringify(newOrder));
  };

  return (
    <Reorder.Group axis="y" values={order} onReorder={handleReorder} className="flex flex-col gap-6">
      {order.map(id => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return null;
        return <WidgetItem key={id} id={id} widget={widget} />;
      })}
    </Reorder.Group>
  );
};
