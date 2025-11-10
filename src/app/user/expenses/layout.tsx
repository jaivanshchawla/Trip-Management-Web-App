
import ExpenseLayout from '@/components/layout/ExpenseLayout';

interface PartyLayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<PartyLayoutProps> = ({ children }) => {

  return (
      <ExpenseLayout >
        {children}
      </ExpenseLayout>
  );
};

export default Layout;
