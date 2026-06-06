/*
  TO ADD REAL IMAGES FOR TEAM MEMBERS:
  1. Add your images to `src/assets/team/` (e.g. `member1.jpg`).
  2. Import them at the top of this file:
     import member1 from '../assets/team/member1.jpg';
  3. Change the `image: null` to `image: member1` for the corresponding member.
*/
import member1 from '../assets/team/JITHIN.jpg';
import member2 from '../assets/team/ABHISHEK.webp';
import member3 from '../assets/team/ASHLIN (2).jpg';
import member4 from '../assets/team/ARYA.jpg';
import member5 from '../assets/team/ARON.jpg';
import member6 from '../assets/team/SANVIYA.jpg';
import member7 from '../assets/team/ARJUN.jpg';
import member8 from '../assets/team/MINHA.jpg';
import member9 from '../assets/team/JEEVAN.jpg';
import member10 from '../assets/team/PALLAVI.webp';


export const EXECOM = [
  { id: 1, name: "Dr. Jithin K Jose", role: "SBC Advisor", image: member1 },
  { id: 2, name: "Abhishek Sankar T", role: "Chair", image: member2 },
  { id: 3, name: "Ashlin Theres James", role: "Vice Chair", image: member3 },
  { id: 4, name: "Arya P S", role: "Secretary", image: member4 },
  { id: 5, name: "Aron Alex", role: "Treasurer", image: member5 },
  { id: 6, name: "Sanvya Sandeep", role: "Joint Secretary", image: member6 },
  { id: 7, name: "Arjun Mohan", role: "Media Lead", image: member7 },
  { id: 8, name: "Minha A", role: "Content Lead", image: member8 },
  { id: 9, name: "Jeevan K J", role: "Event Coordinator", image: member9 },
  { id: 10, name: "Pallavi V", role: "Membership Development Lead", image: member10 },
  
];

export const FAQS = [
  {
    q: "How can I join IEEE IAS?",
    a: "To join the IEEE Industry Applications Society (IAS), you must first be an IEEE member and then add the IAS society membership to your profile via the IEEE Membership Catalog.",
  },
  {
    q: "What are the benefits for IEEE IAS students?",
    a: "Access to workshops, industrial visits, IEEE Xplore, and a global network of engineering professionals. You also get an official digital member ID card.",
  },
  {
    q: "What if I'm only an IEEE member, not IAS?",
    a: "You can still register as an IEEE member and attend most events. IAS membership grants additional perks and access to IAS-exclusive resources.",
  },
];

export const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Industrial Automation Workshop",
    date: "March 25, 2026",
    description: "Hands-on session on PLC and SCADA systems with industry experts.",
    regLink: "https://forms.gle/your-link-here",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  },
];
