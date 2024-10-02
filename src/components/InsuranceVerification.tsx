"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const InsuranceVerification = ({ show }: any) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (show) {
      setShowCard(true);
    }
  }, [show]);

  const container = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.8,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (!showCard) return null;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={item}
              className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600"
            >
              <CheckCircle2 className="w-8 h-8" />
              <span>Eligible</span>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Coinsurance</span>
                <span className="text-lg">20%</span>
              </div>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Remaining Deductible</span>
                <span className="text-lg">$530</span>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <button
                onClick={() => setShowCard(false)}
                className="w-full bg-primary text-primary-foreground rounded-lg py-2 mt-4 hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InsuranceVerification;
