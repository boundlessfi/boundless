import { BasicFormData } from './Basic';
import { DetailsFormData } from './Details';
import { MilestonesFormData } from './Milestones';
import { TeamFormData } from './Team';
import { ContactFormData } from './Contact';

export interface ProjectFormData {
  basic: Partial<BasicFormData>;
  details: Partial<DetailsFormData>;
  milestones: Partial<MilestonesFormData>;
  team: Partial<TeamFormData>;
  contact: Partial<ContactFormData>;
}
