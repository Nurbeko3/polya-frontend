"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: "click" | "payme") => void;
  amount: number;
  isLoading?: boolean;
}

export function PaymentDialog({
  isOpen,
  onClose,
  onSelectMethod,
  amount,
  isLoading,
}: PaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>To'lov usulini tanlang</DialogTitle>
          <DialogDescription>
            Bron tasdiqlash uchun to'lov usulini tanlang
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Jami to'lov:</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(amount)} so'm
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-16 justify-start text-left overflow-hidden border-2 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all rounded-2xl group"
            onClick={() => onSelectMethod("click")}
            disabled={isLoading}
          >
            <div className="w-12 h-10 bg-white dark:bg-slate-200 rounded-lg flex items-center justify-center mr-4 border group-hover:scale-105 transition-transform overflow-hidden px-1">
              <img src="/assets/images/click.jpg" alt="Click" className="w-full h-auto object-contain" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Click</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mt-1">
                Karta orqali to'lov
              </span>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 justify-start text-left overflow-hidden border-2 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all rounded-2xl group"
            onClick={() => onSelectMethod("payme")}
            disabled={isLoading}
          >
            <div className="w-12 h-10 bg-white dark:bg-slate-200 rounded-lg flex items-center justify-center mr-4 border group-hover:scale-105 transition-transform overflow-hidden px-1">
              <img src="/assets/images/payme.jpg" alt="Payme" className="w-full h-auto object-contain" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">Payme</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mt-1">
                Ilova orqali to'lov
              </span>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>

        {isLoading && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            To'lov sahifasiga yo'naltirilmoqdasiz...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
