import React from 'react';
import { Button } from '../ui/button';

const ShopActions = ({ onCreditClick, onPaymentClick }) => {
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
