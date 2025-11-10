import React from 'react';
import { Button } from '../ui/button';

const DriverActions = ({ onGaveClick, onGotClick }) => {
  return (
    <div className="mr-4 flex items-center gap-2">
      <Button
        variant={'destructive'}
        onClick={onGaveClick}
      >
        (-) Driver Gave
      </Button>
      <Button
        variant={'ghost'}
        onClick={onGotClick}
      >
        (+) Driver Got
      </Button>
    </div>
  );
};

export default DriverActions;
