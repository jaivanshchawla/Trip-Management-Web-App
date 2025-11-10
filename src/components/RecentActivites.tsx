import { motion } from 'framer-motion';
import { RxActivityLog } from 'react-icons/rx'; // Ensure this is the correct import for your icons
import { recentIcons } from '@/utils/icons';

const RecentActivities = ({ data }: { data: any}) => {
  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }, // Stagger each child animation
    },
  };

  return (
    <div className='border-t-2 border-t-gray-300 pt-4'>
      {data?.recentActivities?.activities?.length > 0 ? (
        <motion.div
          className='space-y-4' // Add spacing between items
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.recentActivities.activities.map((activity: any, index: number) => (
            <motion.div
              key={index}
              className='flex items-center justify-between mb-4 last:mb-0'
              variants={itemVariants}
            >
              <div className='flex items-center gap-2'>
                <div className="font-medium flex items-center gap-2">
                  {recentIcons[activity.type as string] || (
                    <RxActivityLog
                      size={40}
                      className='text-white bg-blue-500 rounded-lg p-2 border font-semibold'
                    />
                  )}
                  <div className='flex flex-col gap-1'>
                    {activity.type}
                    <p className='text-xs text-gray-400'>
                      {activity.date && new Date(activity.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.p
          className='text-center text-sm text-gray-500'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No Recent Activities
        </motion.p>
      )}
    </div>
  );
};

export default RecentActivities;
