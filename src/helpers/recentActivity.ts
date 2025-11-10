import { RecentActivitiesSchema } from '@/utils/schema';
import {models, model} from 'mongoose'

const RecentActivities = models.RecentActivities || model('RecentActivities', RecentActivitiesSchema);
export async function recentActivity(type : string, activity : any, user : string){
    delete activity['user_id']
    let recentActivity = await RecentActivities.findOne({user_id : user})
        if (!recentActivity){
            recentActivity = new RecentActivities({
                user_id : user,
                activities : [{
                    type : type,
                    data : activity,
                    date : new Date(Date.now())
                }]
            })
        }else{
            if(recentActivity.activities.length == 4){
                recentActivity.activities.pop()
            }
            recentActivity.activities.unshift({
                type : type,
                data : activity,
                date : new Date(Date.now())
            })
        }
        await recentActivity.save()
}