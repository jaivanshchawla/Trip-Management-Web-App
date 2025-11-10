import React from 'react';
import { Button } from '../ui/button';

interface ShopActionsProps {
  onCreditClick: () => void;
  onPaymentClick: () => void;
}

const ShopActions: React.FC<ShopActionsProps> = ({ onCreditClick, onPaymentClick }) => {
  return (
    <div className="mr-4 flex items-center gap-2">
      <Button
        variant={'destructive'}
        onClick={onPaymentClick}
      >
        (-) Shop Payment
      </Button>
      <Button
        variant={'ghost'}
        onClick={onCreditClick}
      >
        (+) Shop Credit
      </Button>
    </div>
  );
};

export default ShopActions;
