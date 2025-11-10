
import ExpenseLayout from '@/components/layout/ExpenseLayout';

const Layout = ({ children }) => {

  return (
      <ExpenseLayout >
        {children}
      </ExpenseLayout>
  );
};

export default Layout;
