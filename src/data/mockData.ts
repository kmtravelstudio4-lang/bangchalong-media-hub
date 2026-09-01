import { Category, Teacher, Resource, News, SchoolDocument, FeaturedVideo, PaCommitteeMember, PaEvaluationRecord } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'กลุ่มสาระฯ ภาษาไทย',
    color: '#E11D48', // Red/Rose
    iconName: 'BookOpen',
    description: 'พัฒนาทักษะการอ่าน การเขียน การฟัง การดู และการพูด ภาษาและวัฒนธรรมไทย',
    resourceCount: 18
  },
  {
    id: 'cat-2',
    name: 'กลุ่มสาระฯ คณิตศาสตร์',
    color: '#0284C7', // Blue
    iconName: 'Calculator',
    description: 'การแก้ปัญหา การให้เหตุผล การสื่อสารความหมายทางคณิตศาสตร์ และการคิดวิเคราะห์',
    resourceCount: 24
  },
  {
    id: 'cat-3',
    name: 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    color: '#059669', // Emerald Green
    iconName: 'Atom',
    description: 'วิทยาศาสตร์ชีวภาพ กายภาพ โลกและอวกาศ วิทยาการคำนวณ และเทคโนโลยีสารสนเทศ',
    resourceCount: 32
  },
  {
    id: 'cat-4',
    name: 'กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม',
    color: '#D97706', // Amber/Orange
    iconName: 'Globe',
    description: 'ศาสนา ศีลธรรม จริยธรรม หน้าที่พลเมือง เศรษฐศาสตร์ และประวัติศาสตร์ภูมิศาสตร์',
    resourceCount: 15
  },
  {
    id: 'cat-5',
    name: 'กลุ่มสาระฯ สุขศึกษาและพลศึกษา',
    color: '#EA580C', // Deep Orange
    iconName: 'Activity',
    description: 'การเจริญเติบโตและพัฒนาการ สุขภาพกายและจิต การเคลื่อนไหว และการเล่นกีฬา',
    resourceCount: 12
  },
  {
    id: 'cat-6',
    name: 'กลุ่มสาระฯ ศิลปะ',
    color: '#7C3AED', // Purple
    iconName: 'Palette',
    description: 'ทัศนศิลป์ ดนตรี และนาฏศิลป์ พัฒนาความคิดสร้างสรรค์และสุนทรียภาพ',
    resourceCount: 14
  },
  {
    id: 'cat-7',
    name: 'กลุ่มสาระฯ การงานอาชีพ',
    color: '#65A30D', // Lime Green
    iconName: 'Briefcase',
    description: 'การดำรงชีวิตและครอบครัว งานบ้าน งานเกษตร งานช่าง และทักษะการประกอบอาชีพ',
    resourceCount: 10
  },
  {
    id: 'cat-8',
    name: 'กลุ่มสาระฯ ภาษาต่างประเทศ',
    color: '#2563EB', // Royal Blue
    iconName: 'Languages',
    description: 'ภาษาอังกฤษและภาษาต่างประเทศ เพื่อการสื่อสาร วัฒนธรรม และการศึกษาต่อ',
    resourceCount: 22
  },
  {
    id: 'cat-9',
    name: 'อนุบาล',
    color: '#EC4899', // Pink
    iconName: 'Sparkles',
    description: 'การศึกษาปฐมวัย ส่งเสริมพัฒนาการ 4 ด้าน ร่างกาย อารมณ์ สังคม และสติปัญญา',
    resourceCount: 16
  },
  {
    id: 'cat-dash',
    name: '-',
    color: '#64748B', // Slate
    iconName: 'Layers',
    description: 'กลุ่มงานสนับสนุนการศึกษา ธุรการ อาคารสถานที่ บริหารทั่วไป และอื่นๆ',
    resourceCount: 8
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'ครูสมชาย ใจดี',
    position: 'ประถมศึกษาปีที่ 5 (ป.5)',
    academicStanding: 'ครูชำนาญการพิเศษ',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    bio: 'มุ่งมั่นพัฒนาสื่อการเรียนรู้ด้านวิทยาศาสตร์และเทคโนโลยี วิทยาการคำนวณ ป.4-ป.6',
    email: 'somchai.j@bangchalong.ac.th',
    facebook: 'ครูสมชาย สอนคอมพิวเตอร์',
    subjectId: 'cat-3',
    subjectName: 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    resourcesCount: 12,
    totalDownloads: 1420,
    createdAt: '2024-01-10',
    paChallengeTitle: 'การพัฒนาทักษะการคิดเชิงคำนวณด้วยกิจกรรมการเขียนโปรแกรม Scratch สำหรับนักเรียนชั้น ป.5',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-2',
    name: 'ครูนภาวรรณ ศรีสุข',
    position: 'ประถมศึกษาปีที่ 4 (ป.4)',
    academicStanding: 'ครูชำนาญการ',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'ผู้เชี่ยวชาญเทคนิคการสอนคณิตศาสตร์แบบ Active Learning และเกมมิฟิเคชัน (Gamification)',
    email: 'naphawan.s@bangchalong.ac.th',
    facebook: 'ครูนภาวรรณ สนุกกับคณิตศาสตร์',
    subjectId: 'cat-2',
    subjectName: 'กลุ่มสาระฯ คณิตศาสตร์',
    resourcesCount: 15,
    totalDownloads: 1890,
    createdAt: '2024-02-15',
    paChallengeTitle: 'การยกระดับผลสัมฤทธิ์ทางการเรียนคณิตศาสตร์ เรื่อง เศษส่วน ผ่านการจัดการเรียนรู้แบบเกมมิฟิเคชัน ชั้น ป.4',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-3',
    name: 'ครูวิชัย พัฒนเมธา',
    position: 'ประถมศึกษาปีที่ 2 (ป.2)',
    academicStanding: 'ครูผู้ช่วย',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    bio: 'ผู้จัดทำสื่อการสอนภาษาอังกฤษ interactive และสื่อการอ่านออกเสียง Phonics',
    email: 'wichai.p@bangchalong.ac.th',
    facebook: 'English with Teacher Wichai',
    subjectId: 'cat-8',
    subjectName: 'กลุ่มสาระฯ ภาษาต่างประเทศ',
    resourcesCount: 9,
    totalDownloads: 980,
    createdAt: '2024-03-01',
    paChallengeTitle: 'การพัฒนาทักษะการออกเสียงคำศัพท์ภาษาอังกฤษ (Phonics) โดยใช้บทเพลงและสื่ออินเทอร์แอคทีฟ ชั้น ป.2',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-4',
    name: 'ครูพรทิพย์ สุวรรณรัตน์',
    position: 'ประถมศึกษาปีที่ 6 (ป.6)',
    academicStanding: 'ครูชำนาญการพิเศษ',
    photo: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    bio: 'ผู้สร้างสรรค์นวัตกรรมการสอนภาษาไทย วรรณคดีไทย และหนังสือเล่มเล็กสำหรับเด็กประถม',
    email: 'porntip.s@bangchalong.ac.th',
    facebook: 'ครูพรทิพย์ รักษ์ภาษาไทย',
    subjectId: 'cat-1',
    subjectName: 'กลุ่มสาระฯ ภาษาไทย',
    resourcesCount: 11,
    totalDownloads: 1350,
    createdAt: '2024-03-20',
    paChallengeTitle: 'การแก้ไขปัญหาการอ่านจับใจความสำคัญของนักเรียนชั้น ป.6 ด้วยเทคนิคบันได 6 ขั้นและแผนผังความคิด',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-5',
    name: 'ครูประเสริฐ สุขสวัสดิ์',
    position: 'ประถมศึกษาปีที่ 3 (ป.3)',
    academicStanding: 'ครูชำนาญการ',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'ครูผู้สอนสังคมศึกษา ประวัติศาสตร์ท้องถิ่น อ.บางพลี และวัฒนธรรมประเพณีรับบัว',
    email: 'prasert.s@bangchalong.ac.th',
    facebook: 'เรียนรู้อดีตเข้าใจปัจจุบันกับครูประเสริฐ',
    subjectId: 'cat-4',
    subjectName: 'กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม',
    resourcesCount: 8,
    totalDownloads: 820,
    createdAt: '2024-04-05',
    paChallengeTitle: '',
    paYear: '2569',
    paVideoUrl: '',
    paDocumentUrl: '',
    paStatus: 'pending'
  },
  {
    id: 't-6',
    name: 'ครูมณีรัตน์ วงศ์ดนตรี',
    position: 'ประถมศึกษาปีที่ 1 (ป.1)',
    academicStanding: 'ครู',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    bio: 'ผู้จัดทำใบงานและสื่อมัลติมีเดียวิชาศิลปะ ดนตรีไทย และนาฏศิลป์พื้นบ้าน',
    email: 'maneerat.w@bangchalong.ac.th',
    facebook: 'ศิลปะและดนตรีกับครูมณีรัตน์',
    subjectId: 'cat-6',
    subjectName: 'กลุ่มสาระฯ ศิลปะ',
    resourcesCount: 7,
    totalDownloads: 640,
    createdAt: '2024-05-12',
    paChallengeTitle: 'การพัฒนาทักษะการคิดสร้างสรรค์ผ่านกิจกรรมศิลปะและงานปั้นสำหรับนักเรียนชั้น ป.1',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-7',
    name: 'ครูชิดชนก ธนกุล',
    position: 'อนุบาล 2',
    academicStanding: 'ครูอัตราจ้าง',
    photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop',
    bio: 'ครูปฐมวัยจัดประสบการณ์การเรียนรู้ผ่านการเล่นและการฝึกกล้ามเนื้อสำหรับเด็กอนุบาล 2',
    email: 'chidchanok.t@bangchalong.ac.th',
    facebook: 'ห้องเรียนหรรษาครูชิดชนก อนุบาล 2',
    subjectId: 'cat-9',
    subjectName: 'อนุบาล',
    resourcesCount: 6,
    totalDownloads: 510,
    createdAt: '2024-06-01',
    paChallengeTitle: 'การพัฒนาทักษะกล้ามเนื้อมัดเล็กและประสาทสัมพันธ์มือกับตาของเด็กปฐมวัยชั้นอนุบาล 2 ด้วยกิจกรรมปั้นดินน้ำมันหรรษา',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-8',
    name: 'ครูอารียา จันทร์กระจ่าง',
    position: 'อนุบาล 3',
    academicStanding: 'ครูพี่เลี้ยง',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    bio: 'ส่งเสริมการเตรียมความพร้อมด้านภาษาและการคิดเชิงตรรกะสำหรับเด็กปฐมวัย อนุบาล 3',
    email: 'areeya.c@bangchalong.ac.th',
    facebook: 'อนุบาล 3 พาเพลิน',
    subjectId: 'cat-9',
    subjectName: 'อนุบาล',
    resourcesCount: 5,
    totalDownloads: 430,
    createdAt: '2024-06-15',
    paChallengeTitle: 'การส่งเสริมทักษะทางภาษาและจินตนาการของเด็กชั้นอนุบาล 3 ด้วยนิทานสร้างสรรค์และการเล่าเรื่องประกอบหุ่นมือ',
    paYear: '2569',
    paVideoUrl: '',
    paDocumentUrl: '',
    paStatus: 'pending'
  },
  // --- รองผู้อำนวยการ 2 ท่าน ---
  {
    id: 't-deputy-1',
    name: 'นางสาวอำพา ยะไม',
    position: 'รองผู้อำนวยการโรงเรียน',
    academicStanding: 'ครูชำนาญการพิเศษ',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'รองผู้อำนวยการโรงเรียนวัดบางโฉลงใน วิทยฐานะชำนาญการพิเศษ รับผิดชอบกลุ่มบริหารงานวิชาการและแผนงาน',
    email: 'ampa.y@bangchalong.ac.th',
    facebook: 'รองฯ อำพา ยะไม',
    subjectId: 'cat-3',
    subjectName: 'ฝ่ายบริหารงานวิชาการและแผนงาน',
    resourcesCount: 14,
    totalDownloads: 1650,
    createdAt: '2024-01-05',
    paChallengeTitle: 'การพัฒนาระบบนิเทศภายในแบบมีส่วนร่วมเพื่อส่งเสริมการจัดการเรียนรู้เชิงรุก (Active Learning) ของครูผู้สอน',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-deputy-2',
    name: 'นางสาวสีจันทร์ สามงามพุ่ม',
    position: 'รองผู้อำนวยการโรงเรียน',
    academicStanding: 'ครูชำนาญการ',
    photo: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    bio: 'รองผู้อำนวยการโรงเรียนวัดบางโฉลงใน วิทยฐานะชำนาญการ รับผิดชอบกลุ่มบริหารงานทั่วไปและบริหารงานบุคคล',
    email: 'seejan.s@bangchalong.ac.th',
    facebook: 'รองฯ สีจันทร์ สามงามพุ่ม',
    subjectId: 'cat-1',
    subjectName: 'ฝ่ายบริหารงานทั่วไปและบุคคล',
    resourcesCount: 10,
    totalDownloads: 1120,
    createdAt: '2024-01-08',
    paChallengeTitle: 'การส่งเสริมและพัฒนาระบบดูแลช่วยเหลือนักเรียนและวินัยเชิงบวกในสถานศึกษาอย่างยั่งยืน',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  // --- บุคลากรทางการศึกษาและสายสนับสนุน ---
  {
    id: 't-staff-1',
    name: 'นางสาวนงลักษณ์ สดใส',
    position: '-',
    academicStanding: 'พี่เลี้ยงเด็กพิการ',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    bio: 'พี่เลี้ยงเด็กพิการ ดูแลช่วยเหลือเด็กที่มีความต้องการพิเศษและส่งเสริมการจัดการเรียนรวม',
    email: 'nonglak.s@bangchalong.ac.th',
    subjectId: 'cat-dash',
    subjectName: '-',
    resourcesCount: 4,
    totalDownloads: 340,
    createdAt: '2024-07-01',
    paChallengeTitle: 'การฝึกทักษะการช่วยเหลือตนเองในชีวิตประจำวันและการปรับตัวในห้องเรียนสำหรับเด็กที่มีความต้องการพิเศษ',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-staff-2',
    name: 'นายบุญส่ง มีพร้อม',
    position: '-',
    academicStanding: 'นักการภารโรง',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
    bio: 'นักการภารโรง ดูแลอาคารสถานที่ ภูมิทัศน์ และความปลอดภัยในโรงเรียน',
    email: 'boonsong.m@bangchalong.ac.th',
    subjectId: 'cat-dash',
    subjectName: '-',
    resourcesCount: 2,
    totalDownloads: 190,
    createdAt: '2024-07-10',
    paChallengeTitle: 'การพัฒนาและปรับปรุงสภาพแวดล้อมอาคารสถานที่และเพิ่มพื้นที่สีเขียวเพื่อสุขอนามัยที่ดีของนักเรียน',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-staff-3',
    name: 'นางสาวกัลยา สุวรรณโชติ',
    position: '-',
    academicStanding: 'ธุรการ',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    bio: 'ธุรการโรงเรียน ดูแลระบบงานสารบรรณ เอกสารราชการ ข้อมูลสารสนเทศ',
    email: 'kanlaya.s@bangchalong.ac.th',
    subjectId: 'cat-dash',
    subjectName: '-',
    resourcesCount: 5,
    totalDownloads: 480,
    createdAt: '2024-07-15',
    paChallengeTitle: 'การเพิ่มประสิทธิภาพระบบงานสารบรรณอิเล็กทรอนิกส์ (e-Document) และการจัดเก็บสืบค้นเอกสารราชการ',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  },
  {
    id: 't-staff-4',
    name: 'นายอดิศักดิ์ ศรีวิชัย',
    position: '-',
    academicStanding: 'เจ้าหน้าที่',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'เจ้าหน้าที่ฝ่ายสนับสนุนการศึกษา ดูแลระบบสารสนเทศและงานเทคโนโลยีโรงเรียน',
    email: 'adisak.s@bangchalong.ac.th',
    subjectId: 'cat-dash',
    subjectName: '-',
    resourcesCount: 3,
    totalDownloads: 290,
    createdAt: '2024-07-20',
    paChallengeTitle: 'การพัฒนาระบบเครือข่ายสารสนเทศและการดูแลอุปกรณ์คอมพิวเตอร์เพื่อการจัดการเรียนรู้',
    paYear: '2569',
    paVideoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    paDocumentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    paStatus: 'completed'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  // --- ครูสมชาย ใจดี (t-1) ---
  {
    id: 'res-1',
    title: 'ชุดกิจกรรมการเรียนรู้ วิทยาการคำนวณ: การเขียนโปรแกรมแบบบล็อก (Scratch) ชั้น ป.5',
    description: 'ชุดกิจกรรมฝึกทักษะการคิดเชิงคำนวณและการเขียนโปรแกรม Scratch เบื้องต้น พร้อมใบงาน กิจกรรมกลุ่ม และแบบทดสอบก่อน-หลังเรียน เหมาะสำหรับนักเรียนระดับชั้นประถมศึกษาปีที่ 5',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    teacherPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-3',
    categoryName: 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    categoryColor: '#059669',
    gradeLevel: 'ป.5',
    tags: ['วิทยาการคำนวณ', 'Scratch', 'โค้ดดิ้ง', 'ป.5', 'Active Learning'],
    downloads: 540,
    views: 1280,
    rating: 4.9,
    createdAt: '2026-08-26',
    updatedAt: '2026-08-26',
    featured: true
  },
  {
    id: 'res-7',
    title: 'แผนการจัดการเรียนรู้และใบงาน สุขศึกษา เรื่อง โภชนาการสมวัยและการออกกำลังกาย',
    description: 'เอกสาร Word สามารถแก้ไขได้ สำหรับครูผู้สอนสุขศึกษา ชั้น ป.3 พร้อมใบงานระบายสีธงโภชนาการ และตารางบันทึกการออกกำลังกายประจำสัปดาห์',
    cover: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'Word',
    fileSize: '1.8 MB',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    teacherPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-5',
    categoryName: 'กลุ่มสาระฯ สุขศึกษาและพลศึกษา',
    categoryColor: '#EA580C',
    gradeLevel: 'ป.3',
    tags: ['สุขศึกษา', 'โภชนาการ', 'แผนการสอน', 'Word', 'ป.3'],
    downloads: 230,
    views: 510,
    rating: 4.5,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    featured: false
  },
  {
    id: 'res-9',
    title: 'ใบงานวิทยาศาสตร์และกิจกรรมการทดลอง: การต่อวงจรไฟฟ้าอย่างง่าย ชั้น ป.6',
    description: 'ใบงานการทดลองวิทยาศาสตร์เรื่องการต่อวงจรไฟฟ้าแบบอนุกรมและขนาน พร้อมแนวทางการสรุปผลการทดลองและการประเมินทักษะกระบวนการทางวิทยาศาสตร์',
    cover: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '3.1 MB',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    teacherPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-3',
    categoryName: 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    categoryColor: '#059669',
    gradeLevel: 'ป.6',
    tags: ['วิทยาศาสตร์', 'วงจรไฟฟ้า', 'การทดลอง', 'ป.6'],
    downloads: 310,
    views: 680,
    rating: 4.8,
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    featured: false
  },
  {
    id: 'res-10',
    title: 'ชุดสื่อการสอนดิจิทัล: การรู้เท่าทันสื่อดิจิทัลและการป้องกันภัยไซเบอร์ ป.4',
    description: 'สไลด์นำเสนอ Canva และแบบทดสอบออนไลน์เรื่องการตั้งรหัสผ่านที่ปลอดภัย การสังเกตข่าวปลอม (Fake News) และมารยาทบนโลกออนไลน์',
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://canva.com/design/demo-digital-safety',
    previewUrl: 'https://canva.com/design/demo-digital-safety',
    fileType: 'Canva Link',
    fileSize: 'Online Link',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    teacherPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-3',
    categoryName: 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี',
    categoryColor: '#059669',
    gradeLevel: 'ป.4',
    tags: ['วิทยาการคำนวณ', 'ภัยไซเบอร์', 'ป.4', 'Canva'],
    downloads: 340,
    views: 790,
    rating: 4.7,
    createdAt: '2026-08-18',
    updatedAt: '2026-08-18',
    featured: true
  },

  // --- ครูนภาวรรณ ศรีสุข (t-2) ---
  {
    id: 'res-2',
    title: 'สไลด์การสอนคณิตศาสตร์: เรื่องเศษส่วนและการบวกลบเศษส่วน (PowerPoint & Canva)',
    description: 'สไลด์การสอนประกอบภาพเคลื่อนไหวสีสันสดใส เข้าใจง่าย สอนขั้นตอนการหา ค.ร.น. และการบวกลบเศษส่วนที่มีตัวส่วนไม่เท่ากัน พร้อมโจทย์แบบฝึกหัดท้าทาย',
    cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://canva.com/design/demo-math-fractions',
    previewUrl: 'https://canva.com/design/demo-math-fractions',
    fileType: 'Canva Link',
    fileSize: 'Online Link',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-2',
    categoryName: 'กลุ่มสาระฯ คณิตศาสตร์',
    categoryColor: '#0284C7',
    gradeLevel: 'ป.6',
    tags: ['คณิตศาสตร์', 'เศษส่วน', 'สไลด์การสอน', 'Canva', 'ป.6'],
    downloads: 412,
    views: 950,
    rating: 4.8,
    createdAt: '2026-08-27',
    updatedAt: '2026-08-27',
    featured: true
  },
  {
    id: 'res-8',
    title: 'ชุดคลังใบงานและเทมเพลต การงานอาชีพ: งานประดิษฐ์จากวัสดุเหลือใช้ในท้องถิ่น (ZIP)',
    description: 'รวบรวมไฟล์รูปภาพ ขั้นตอนการทำสิ่งประดิษฐ์จากขวดพลาสติก ใบกล้วย และวัสดุท้องถิ่นบางพลี พร้อมไฟล์แบบประเมินชิ้นงาน',
    cover: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'ZIP',
    fileSize: '24.5 MB',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-7',
    categoryName: 'กลุ่มสาระฯ การงานอาชีพ',
    categoryColor: '#65A30D',
    gradeLevel: 'ป.5',
    tags: ['การงานอาชีพ', 'งานประดิษฐ์', 'วัสดุเหลือใช้', 'ZIP', 'ป.5'],
    downloads: 310,
    views: 690,
    rating: 4.8,
    createdAt: '2026-08-26',
    updatedAt: '2026-08-26',
    featured: false
  },
  {
    id: 'res-12',
    title: 'เกมกระดานคณิตศาสตร์ (Board Game): ตะลุยเขาวงกตสูตรคูณและการหาร ชั้น ป.4',
    description: 'สื่อเกมกระดาน Printable PDF สำหรับพิมพ์และตัดแปะ พัฒนาทักษะการคิดเลขเร็ว การจำสูตรคูณแม่ 2-12 และการหารจำนวนนับ',
    cover: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '8.4 MB',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-2',
    categoryName: 'กลุ่มสาระฯ คณิตศาสตร์',
    categoryColor: '#0284C7',
    gradeLevel: 'ป.4',
    tags: ['คณิตศาสตร์', 'เกมคณิตศาสตร์', 'สูตรคูณ', 'ป.4'],
    downloads: 480,
    views: 1040,
    rating: 5.0,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    featured: true
  },
  {
    id: 'res-13',
    title: 'แบบฝึกทักษะคณิตศาสตร์ เรื่อง รูปเรขาคณิตสามมิติและการหาปริมาตร ชั้น ป.6',
    description: 'แบบฝึกทักษะพร้อมรูปภาพคลี่ของปริซึม พีระมิด ทรงกระบอก และสูตรการคำนวณพื้นที่ผิวและปริมาตร พร้อมโจทย์ข้อสอบแข่งขัน',
    cover: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '5.2 MB',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-2',
    categoryName: 'กลุ่มสาระฯ คณิตศาสตร์',
    categoryColor: '#0284C7',
    gradeLevel: 'ป.6',
    tags: ['คณิตศาสตร์', 'เรขาคณิต', 'ปริมาตร', 'ป.6'],
    downloads: 360,
    views: 820,
    rating: 4.9,
    createdAt: '2026-08-23',
    updatedAt: '2026-08-23',
    featured: false
  },
  {
    id: 'res-14',
    title: 'ชุดข้อสอบจำลอง O-NET คณิตศาสตร์ ป.6 พร้อมเฉลยละเอียดและวิเคราะห์ตัวชี้วัด',
    description: 'ข้อสอบคณิตศาสตร์ 100 ข้อ จำลองตามพิมพ์เขียว Test Blueprint สทศ. เพื่อเตรียมความพร้อมนักเรียนชั้น ป.6',
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://drive.google.com/drive/folders/demo-onet-math-p6',
    previewUrl: 'https://drive.google.com/drive/folders/demo-onet-math-p6',
    fileType: 'Google Drive Link',
    fileSize: 'Cloud Drive',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    teacherPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-2',
    categoryName: 'กลุ่มสาระฯ คณิตศาสตร์',
    categoryColor: '#0284C7',
    gradeLevel: 'ป.6',
    tags: ['ONET', 'คณิตศาสตร์', 'ข้อสอบ', 'ป.6'],
    downloads: 520,
    views: 1180,
    rating: 4.9,
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15',
    featured: true
  },

  // --- ครูวิชัย พัฒนเมธา (t-3) ---
  {
    id: 'res-3',
    title: 'บทเรียนอิเล็กทรอนิกส์ Phonics & Daily Conversation English ม.1',
    description: 'เอกสารและลิงก์สื่อวิดีโอฝึกการออกเสียงสระและพยัญชนะภาษาอังกฤษ Phonics พร้อมบทสนทนาในชีวิตประจำวันสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1',
    cover: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://drive.google.com/drive/folders/demo-english-m1',
    previewUrl: 'https://drive.google.com/drive/folders/demo-english-m1',
    fileType: 'Google Drive Link',
    fileSize: 'Cloud Drive',
    teacherId: 't-3',
    teacherName: 'ครูวิชัย พัฒนเมธา',
    teacherPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครู คศ.1',
    categoryId: 'cat-8',
    categoryName: 'กลุ่มสาระฯ ภาษาต่างประเทศ',
    categoryColor: '#2563EB',
    gradeLevel: 'ม.1',
    tags: ['ภาษาอังกฤษ', 'Phonics', 'English', 'ม.1', 'Google Drive'],
    downloads: 320,
    views: 780,
    rating: 4.7,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    featured: true
  },
  {
    id: 'res-16',
    title: 'Flashcards บัตรคำศัพท์ภาพคำกริยาและคำศัพท์ชีวิตประจำวัน Daily Routine ป.2',
    description: 'ชุดบัตรภาพสีสวยงาม 50 คำศัพท์ พร้อมไฟล์เสียงอ่านออกเสียงภาษาอังกฤษมาตรฐาน สำหรับฝึกนักเรียนประถมศึกษาปีที่ 2',
    cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '6.7 MB',
    teacherId: 't-3',
    teacherName: 'ครูวิชัย พัฒนเมธา',
    teacherPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูผู้ช่วย',
    categoryId: 'cat-8',
    categoryName: 'กลุ่มสาระฯ ภาษาต่างประเทศ',
    categoryColor: '#2563EB',
    gradeLevel: 'ป.2',
    tags: ['ภาษาอังกฤษ', 'Flashcards', 'คำศัพท์', 'ป.2'],
    downloads: 390,
    views: 890,
    rating: 4.9,
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    featured: false
  },
  {
    id: 'res-17',
    title: 'สไลด์นำเสนอ Canva: English Phonics Fun with Alphabets A-Z',
    description: 'สื่อสไลด์นำเสนอประกอบบทเพลง Phonics Song สำหรับฝึกเด็กออกเสียงพยัญชนะต้นและสระเดี่ยวในภาษาอังกฤษ',
    cover: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://canva.com/design/demo-phonics-az',
    previewUrl: 'https://canva.com/design/demo-phonics-az',
    fileType: 'Canva Link',
    fileSize: 'Online Link',
    teacherId: 't-3',
    teacherName: 'ครูวิชัย พัฒนเมธา',
    teacherPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูผู้ช่วย',
    categoryId: 'cat-8',
    categoryName: 'กลุ่มสาระฯ ภาษาต่างประเทศ',
    categoryColor: '#2563EB',
    gradeLevel: 'ป.2',
    tags: ['ภาษาอังกฤษ', 'Phonics', 'Canva', 'ป.2'],
    downloads: 270,
    views: 640,
    rating: 4.6,
    createdAt: '2026-08-21',
    updatedAt: '2026-08-21',
    featured: false
  },

  // --- ครูพรทิพย์ สุวรรณรัตน์ (t-4) ---
  {
    id: 'res-4',
    title: 'แบบฝึกทักษะการอ่านจับใจความสำคัญ วรรณคดีเรื่อง พระอภัยมณี ตอน หนีนางผีเสื้อสมุทร',
    description: 'แบบฝึกทักษะภาษาไทยอ่านจับใจความ ถอดบทเรียน ผังความคิด (Mind Mapping) และการวิเคราะห์ตัวละครในวรรณคดีไทยชั้น ม.2',
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '5.8 MB',
    teacherId: 't-4',
    teacherName: 'ครูพรทิพย์ สุวรรณรัตน์',
    teacherPhoto: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-1',
    categoryName: 'กลุ่มสาระฯ ภาษาไทย',
    categoryColor: '#E11D48',
    gradeLevel: 'ม.2',
    tags: ['ภาษาไทย', 'วรรณคดี', 'พระอภัยมณี', 'จับใจความ', 'ม.2'],
    downloads: 480,
    views: 1100,
    rating: 5.0,
    createdAt: '2026-08-26',
    updatedAt: '2026-08-26',
    featured: true
  },
  {
    id: 'res-19',
    title: 'หนังสือเล่มเล็ก (Mini Book): มาตราตัวสะกด 8 แม่ ฉบับจำง่ายเข้าใจไว ป.6',
    description: 'เทมเพลตพับหนังสือเล่มเล็กพร้อมเนื้อหากลอนมาตราตัวสะกด และแบบทดสอบท้ายเล่มสำหรับนักเรียนชั้น ป.6',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '3.9 MB',
    teacherId: 't-4',
    teacherName: 'ครูพรทิพย์ สุวรรณรัตน์',
    teacherPhoto: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-1',
    categoryName: 'กลุ่มสาระฯ ภาษาไทย',
    categoryColor: '#E11D48',
    gradeLevel: 'ป.6',
    tags: ['ภาษาไทย', 'มาตราตัวสะกด', 'หนังสือเล่มเล็ก', 'ป.6'],
    downloads: 410,
    views: 930,
    rating: 4.9,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    featured: true
  },
  {
    id: 'res-20',
    title: 'แบบฝึกพัฒนาการอ่านจับใจความด้วยเทคนิคบันได 6 ขั้น นิทานพื้นบ้านภาคกลาง ป.6',
    description: 'นวัตกรรมแบบฝึกทักษะเพื่อแก้ปัญหาการอ่านไม่ออกเขียนไม่ได้ และฝึกการสรุปใจความสำคัญจากนิทานพื้นบ้าน',
    cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'Word',
    fileSize: '2.4 MB',
    teacherId: 't-4',
    teacherName: 'ครูพรทิพย์ สุวรรณรัตน์',
    teacherPhoto: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการพิเศษ',
    categoryId: 'cat-1',
    categoryName: 'กลุ่มสาระฯ ภาษาไทย',
    categoryColor: '#E11D48',
    gradeLevel: 'ป.6',
    tags: ['ภาษาไทย', 'บันได 6 ขั้น', 'นิทานพื้นบ้าน', 'ป.6'],
    downloads: 460,
    views: 990,
    rating: 4.9,
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
    featured: false
  },

  // --- ครูประเสริฐ สุขสวัสดิ์ (t-5) ---
  {
    id: 'res-5',
    title: 'ชุดสื่อการเรียนรู้ประวัติศาสตร์ท้องถิ่น: ตำนานประเพณีรับบัว อำเภอบางพลี จ.สมุทรปราการ',
    description: 'นวัตกรรมสื่อการสอนประวัติศาสตร์และภูมิปัญญาท้องถิ่น อ.บางพลี พร้อมไฟล์วิดีโอพรีเซนเทชัน เอกสารประกอบ และแบบทดสอบความรู้',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    previewUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    fileType: 'Video',
    fileSize: 'HD Video',
    teacherId: 't-5',
    teacherName: 'ครูประเสริฐ สุขสวัสดิ์',
    teacherPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-4',
    categoryName: 'กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม',
    categoryColor: '#D97706',
    gradeLevel: 'ทุกระดับชั้น',
    tags: ['ประวัติศาสตร์', 'ท้องถิ่นบางพลี', 'ประเพณีรับบัว', 'สังคมศึกษา', 'สมุทรปราการ'],
    downloads: 390,
    views: 1450,
    rating: 4.9,
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    featured: true
  },
  {
    id: 'res-22',
    title: 'แผนที่ประวัติศาสตร์และแหล่งท่องเที่ยวเชิงวัฒนธรรมชุมชนคลองสำโรง ป.3',
    description: 'ใบงานภาพกราฟิกแผนที่ชุมชนรอบวัดบางโฉลงใน ศึกษาประวัติความเป็นมา วิถีชีวิตริมน้ำ และอาชีพในท้องถิ่น',
    cover: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '4.5 MB',
    teacherId: 't-5',
    teacherName: 'ครูประเสริฐ สุขสวัสดิ์',
    teacherPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูชำนาญการ',
    categoryId: 'cat-4',
    categoryName: 'กลุ่มสาระฯ สังคมศึกษา ศาสนา และวัฒนธรรม',
    categoryColor: '#D97706',
    gradeLevel: 'ป.3',
    tags: ['สังคมศึกษา', 'คลองสำโรง', 'ประวัติศาสตร์', 'ป.3'],
    downloads: 250,
    views: 580,
    rating: 4.6,
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
    featured: false
  },

  // --- ครูมณีรัตน์ วงศ์ดนตรี (t-6) ---
  {
    id: 'res-6',
    title: 'สไลด์พาวเวอร์พอยต์การสอนดนตรีไทย: เครื่องดนตรีไทย 4 ประเภท (PowerPoint)',
    description: 'ไฟล์ PowerPoint นำเสนอเรื่อง ดีด สี ตี เป่า สื่อรูปภาพและเสียงดนตรีประกอบคำอธิบาย พร้อมแบบฝึกหัดแยกประเภทเครื่องดนตรี',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PowerPoint',
    fileSize: '12.4 MB',
    teacherId: 't-6',
    teacherName: 'ครูมณีรัตน์ วงศ์ดนตรี',
    teacherPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครู คศ.1',
    categoryId: 'cat-6',
    categoryName: 'กลุ่มสาระฯ ศิลปะ',
    categoryColor: '#7C3AED',
    gradeLevel: 'ป.4',
    tags: ['ดนตรีไทย', 'ศิลปะ', 'PPT', 'ป.4', 'เครื่องดนตรี'],
    downloads: 280,
    views: 620,
    rating: 4.6,
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    featured: true
  },
  {
    id: 'res-24',
    title: 'ใบงานฝึกทักษะการวาดภาพระบายสี: วงล้อสีและแม่สีขั้นที่ 1-2 ชั้น ป.1',
    description: 'ใบงานศิลปะระบายสีผสมสีน้ำ แม่สี แดง เหลือง น้ำเงิน และการเกิดสีขั้นที่ 2 สำหรับนักเรียนชั้น ป.1',
    cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '3.4 MB',
    teacherId: 't-6',
    teacherName: 'ครูมณีรัตน์ วงศ์ดนตรี',
    teacherPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครู คศ.1',
    categoryId: 'cat-6',
    categoryName: 'กลุ่มสาระฯ ศิลปะ',
    categoryColor: '#7C3AED',
    gradeLevel: 'ป.1',
    tags: ['ศิลปะ', 'แม่สี', 'ระบายสี', 'ป.1'],
    downloads: 360,
    views: 710,
    rating: 4.8,
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
    featured: false
  },

  // --- ครูชิดชนก ธนกุล (t-7) ---
  {
    id: 'res-26',
    title: 'ชุดแบบฝึกพัฒนากล้ามเนื้อมัดเล็ก: ลากเส้นตามรอยประและระบายสีสร้างสรรค์ อนุบาล 2',
    description: 'ชุดแบบฝึก 30 หน้า พัฒนาการประสานสัมพันธ์ระหว่างมือกับสายตา และการบังคับทิศทางดินสอ สำหรับเด็กปฐมวัย',
    cover: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    teacherId: 't-7',
    teacherName: 'ครูชิดชนก ธนกุล',
    teacherPhoto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูอัตราจ้าง',
    categoryId: 'cat-7',
    categoryName: 'การศึกษาปฐมวัย',
    categoryColor: '#65A30D',
    gradeLevel: 'อนุบาล 2',
    tags: ['ปฐมวัย', 'กล้ามเนื้อมัดเล็ก', 'ลากเส้น', 'อนุบาล 2'],
    downloads: 310,
    views: 720,
    rating: 4.9,
    createdAt: '2026-08-25',
    updatedAt: '2026-08-25',
    featured: true
  },
  {
    id: 'res-27',
    title: 'สื่อบัตรภาพส่งเสริมพัฒนาการ: สัตว์โลกน่ารู้และธรรมชาติรอบตัว อนุบาล 2',
    description: 'บัตรภาพคำศัพท์ภาษาไทย-อังกฤษ พร้อมเสียงร้องของสัตว์น่ารัก สำหรับกิจกรรมวงกลมยามเช้าของเด็กอนุบาล 2',
    cover: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://canva.com/design/demo-kindergarten-animals',
    previewUrl: 'https://canva.com/design/demo-kindergarten-animals',
    fileType: 'Canva Link',
    fileSize: 'Online Link',
    teacherId: 't-7',
    teacherName: 'ครูชิดชนก ธนกุล',
    teacherPhoto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูอัตราจ้าง',
    categoryId: 'cat-7',
    categoryName: 'การศึกษาปฐมวัย',
    categoryColor: '#65A30D',
    gradeLevel: 'อนุบาล 2',
    tags: ['ปฐมวัย', 'สัตว์น่ารู้', 'Canva', 'อนุบาล 2'],
    downloads: 200,
    views: 450,
    rating: 4.7,
    createdAt: '2026-08-21',
    updatedAt: '2026-08-21',
    featured: false
  },

  // --- ครูอารียา จันทร์กระจ่าง (t-8) ---
  {
    id: 'res-28',
    title: 'นิทานหุ่นมือส่งเสริมคุณธรรม: นิทานอีสปสอนใจพร้อมกิจกรรมสร้างสรรค์ อนุบาล 3',
    description: 'ชุดนิทานอีสปพร้อมภาพประกอบสำหรับตัดทำหุ่นนิ้วมือและหุ่นมือกระดาษ เพื่อฝึกการสื่อสารและการกล้าแสดงออก',
    cover: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    teacherId: 't-8',
    teacherName: 'ครูอารียา จันทร์กระจ่าง',
    teacherPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูอัตราจ้าง',
    categoryId: 'cat-7',
    categoryName: 'การศึกษาปฐมวัย',
    categoryColor: '#65A30D',
    gradeLevel: 'อนุบาล 3',
    tags: ['ปฐมวัย', 'นิทาน', 'หุ่นมือ', 'อนุบาล 3'],
    downloads: 240,
    views: 510,
    rating: 4.8,
    createdAt: '2026-08-24',
    updatedAt: '2026-08-24',
    featured: true
  },
  {
    id: 'res-29',
    title: 'ใบกิจกรรมเสริมทักษะคณิตศาสตร์ปฐมวัย: การนับจำนวน 1-20 และการเปรียบเทียบ อนุบาล 3',
    description: 'แบบฝึกเสริมทักษะความคิดเชิงคณิตศาสตร์ การจัดหมวดหมู่ การจับคู่ และการนับจำนวนอย่างสนุกสนาน',
    cover: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=600&auto=format&fit=crop',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF',
    fileSize: '3.6 MB',
    teacherId: 't-8',
    teacherName: 'ครูอารียา จันทร์กระจ่าง',
    teacherPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    teacherPosition: 'ครูอัตราจ้าง',
    categoryId: 'cat-7',
    categoryName: 'การศึกษาปฐมวัย',
    categoryColor: '#65A30D',
    gradeLevel: 'อนุบาล 3',
    tags: ['ปฐมวัย', 'คณิตศาสตร์ปฐมวัย', 'การนับเลข', 'อนุบาล 3'],
    downloads: 190,
    views: 420,
    rating: 4.7,
    createdAt: '2026-08-19',
    updatedAt: '2026-08-19',
    featured: false
  }
];

export const INITIAL_NEWS: News[] = [
  {
    id: 'news-1',
    title: 'โรงเรียนวัดบางโฉลงใน เปิดให้บริการ "คลังสื่อการสอนออนไลน์" เต็มรูปแบบ',
    content: 'คณะครูและบุคลากรทางการศึกษา โรงเรียนวัดบางโฉลงใน ได้ร่วมกันพัฒนาและรวบรวมสื่อการสอน ใบงาน แผนการสอน และนวัตกรรมทางวิชาการขึ้นสู่ระบบคลังสื่อการสอนดิจิทัล เพื่อเปิดโอกาสให้นักเรียน ผู้ปกครอง และครูผู้สนใจสามารถเข้าถึงและดาวน์โหลดนำไปใช้ประโยชน์ในการจัดการเรียนรู้ได้อย่างสะดวกและรวดเร็ว',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    category: 'ข่าวประชาสัมพันธ์',
    author: 'ฝ่ายวิชาการ โรงเรียนวัดบางโฉลงใน',
    pinned: true,
    createdAt: '2026-08-01'
  },
  {
    id: 'news-2',
    title: 'ขอแสดงความยินดีกับ คณะครูโรงเรียนวัดบางโฉลงใน ที่ได้รับรางวัลนวัตกรรมการสอนดีเด่น',
    content: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี และกลุ่มสาระการเรียนรู้ภาษาไทย ได้รับรางวัลผลงานนวัตกรรมการจัดการเรียนรู้แบบ Active Learning ระดับเขตพื้นที่การศึกษาประจำปี 2569',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    category: 'ผลงานและรางวัล',
    author: 'งานประชาสัมพันธ์',
    pinned: true,
    createdAt: '2026-07-28'
  },
  {
    id: 'news-3',
    title: 'ขอเชิญชวนครูและบุคลากร อัปโหลดและแชร์สื่อการสอนประจำภาคเรียนที่ 1/2569',
    content: 'ฝ่ายวิชาการขอเชิญชวนครูทุกกลุ่มสาระการเรียนรู้ อัปโหลดสื่อการสอน สไลด์บรรยาย ใบงาน และคลิปวิดีโอเข้าสู่ระบบเพื่อใช้เป็นคลังเรียนรู้ร่วมกันของโรงเรียน',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
    category: 'ประกาศโรงเรียน',
    author: 'ผู้ดูแลระบบ',
    pinned: false,
    createdAt: '2026-07-20'
  }
];

export const INITIAL_DOCUMENTS: SchoolDocument[] = [
  {
    id: 'doc-1',
    title: 'แบบฟอร์มแผนการจัดการเรียนรู้ แบบย่อ (Active Learning Mode) ปีการศึกษา 2569',
    category: 'แผนการจัดการเรียนรู้',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'Word (.docx)',
    fileSize: '450 KB',
    updatedAt: '2026-07-01',
    downloads: 380
  },
  {
    id: 'doc-2',
    title: 'คู่มือและแบบประเมินผลสัมฤทธิ์ทางการเรียน SAR ครูผู้สอน รายบุคคล',
    category: 'เอกสาร SAR',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF (.pdf)',
    fileSize: '2.1 MB',
    updatedAt: '2026-06-15',
    downloads: 510
  },
  {
    id: 'doc-3',
    title: 'แบบฟอร์มขออนุมัติจัดทำและเผยแพร่สื่อการสอน / นวัตกรรมครู',
    category: 'แบบฟอร์มโรงเรียน',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'PDF (.pdf)',
    fileSize: '180 KB',
    updatedAt: '2026-05-20',
    downloads: 290
  },
  {
    id: 'doc-4',
    title: 'แบบเค้าโครงงานวิจัยในชั้นเรียน (Classroom Action Research)',
    category: 'วิจัยในชั้นเรียน',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileType: 'Word (.docx)',
    fileSize: '320 KB',
    updatedAt: '2026-05-10',
    downloads: 420
  }
];

export const getYouTubeId = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  // Check if it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return (match && match[1]) ? match[1] : trimmed;
};

export const getYouTubeEmbedUrl = (url: string, autoplay = true): string | null => {
  const ytId = getYouTubeId(url);
  if (!ytId || ytId.length !== 11) return null;
  return `https://www.youtube.com/embed/${ytId}${autoplay ? '?autoplay=1' : ''}`;
};

export const INITIAL_VIDEOS: FeaturedVideo[] = [
  {
    id: 'vid-1',
    title: 'วิดีโอแนะนำโรงเรียนวัดบางโฉลงใน และบรรยากาศการจัดการเรียนรู้',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    description: 'รับชมคลิปแนะนำโรงเรียน บรรยากาศการเรียนการสอน และกิจกรรมส่งเสริมศักยภาพผู้เรียนของโรงเรียนวัดบางโฉลงใน',
    createdAt: '2569-08-01'
  },
  {
    id: 'vid-2',
    title: 'กิจกรรมส่งเสริมการเรียนรู้ Active Learning กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    description: 'นวัตกรรมสื่อการสอนวิทย์ยุคใหม่ เน้นการปฏิบัติจริงและการใช้เทคโนโลยีสร้างสรรค์ในห้องเรียน',
    createdAt: '2569-07-20'
  },
  {
    id: 'vid-3',
    title: 'ภาพบรรยากาศการเปิดบ้านวิชาการ Open House โรงเรียนวัดบางโฉลงใน',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    description: 'การนำเสนอผลงานนักเรียน นวัตกรรมครู และการแสดงความสามารถหลากหลายมิติ',
    createdAt: '2569-07-10'
  }
];

export const normalizeStanding = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/\s+/g, ' ');
};

/**
 * Strict eligibility check for Committee Set 1:
 * ONLY 'ครูชำนาญการ' and 'ครูชำนาญการพิเศษ' (and standalone 'ชำนาญการ' / 'ชำนาญการพิเศษ').
 * Strictly forbidden from matching 'ครู', 'ครูผู้ช่วย', 'ครูอัตราจ้าง', support staff, etc.
 */
export const isTeacherSet1Eligible = (teacher?: Teacher | null): boolean => {
  if (!teacher) return false;
  const standing = normalizeStanding(teacher.academicStanding);
  const position = normalizeStanding(teacher.position);

  // Strictly allowed exact matches for Set 1 (ครูชำนาญการ และ ครูชำนาญการพิเศษ)
  const ALLOWED_SET_1_EXACT = [
    'ครูชำนาญการพิเศษ',
    'ชำนาญการพิเศษ',
    'ครูชำนาญการ',
    'ชำนาญการ'
  ];

  if (standing && ALLOWED_SET_1_EXACT.includes(standing)) {
    return true;
  }
  if (!standing && position && ALLOWED_SET_1_EXACT.includes(position)) {
    return true;
  }
  return false;
};

/**
 * Strict eligibility check for Committee Set 2:
 * ONLY 'ครู' (ค.ศ.1) and 'ครูผู้ช่วย'
 */
export const isTeacherSet2Eligible = (teacher?: Teacher | null): boolean => {
  if (!teacher) return false;
  if (isTeacherSet1Eligible(teacher)) return false;

  const standing = normalizeStanding(teacher.academicStanding);
  const position = normalizeStanding(teacher.position);

  const DISQUALIFIED_STAFF = [
    'ครูชำนาญการพิเศษ',
    'ชำนาญการพิเศษ',
    'ครูชำนาญการ',
    'ชำนาญการ',
    'ครูอัตราจ้าง',
    'อัตราจ้าง',
    'ครูพี่เลี้ยง',
    'พี่เลี้ยง',
    'พี่เลี้ยงเด็กพิการ',
    'พี่เลี้ยงเด็กพิเศษ',
    'นักการภารโรง',
    'นักการ',
    'ภารโรง',
    'เจ้าหน้าที่',
    'ธุรการ',
    'เจ้าหน้าที่ธุรการ'
  ];

  if (DISQUALIFIED_STAFF.includes(standing) || DISQUALIFIED_STAFF.includes(position)) {
    return false;
  }

  const ALLOWED_SET_2_EXACT = [
    'ครู',
    'ครูผู้ช่วย',
    'ครู คศ.1',
    'ครูคศ.1',
    'ครู ค.ศ.1',
    'ครูค.ศ.1',
    'คศ.1',
    'ค.ศ.1'
  ];

  if (standing && ALLOWED_SET_2_EXACT.includes(standing)) {
    return true;
  }
  if (!standing && position && ALLOWED_SET_2_EXACT.includes(position)) {
    return true;
  }
  return false;
};

/**
 * Strict eligibility check for Committee Set 3:
 * ONLY ครูอัตราจ้าง, พี่เลี้ยงเด็กพิเศษ/พิการ, ครูพี่เลี้ยง, นักการภารโรง, เจ้าหน้าที่ธุรการ
 */
export const isTeacherSet3Eligible = (teacher?: Teacher | null): boolean => {
  if (!teacher) return false;
  if (isTeacherSet1Eligible(teacher) || isTeacherSet2Eligible(teacher)) return false;

  const standing = normalizeStanding(teacher.academicStanding);
  const position = normalizeStanding(teacher.position);

  const ALLOWED_SET_3_EXACT = [
    'ครูอัตราจ้าง',
    'อัตราจ้าง',
    'พี่เลี้ยงเด็กพิการ',
    'พี่เลี้ยงเด็กพิเศษ',
    'ครูพี่เลี้ยง',
    'พี่เลี้ยง',
    'นักการภารโรง',
    'นักการ',
    'ภารโรง',
    'เจ้าหน้าที่',
    'ธุรการ',
    'เจ้าหน้าที่ธุรการ'
  ];

  if (standing && ALLOWED_SET_3_EXACT.includes(standing)) {
    return true;
  }
  if (!standing && position && ALLOWED_SET_3_EXACT.includes(position)) {
    return true;
  }
  return false;
};

/**
 * Single source of truth for committee set classification (1, 2, 3, or null if unassigned/unclassified).
 */
export const getTeacherCommitteeSetNumber = (teacher?: Teacher | null): 1 | 2 | 3 | null => {
  if (!teacher) return null;
  if (isTeacherSet1Eligible(teacher)) return 1;
  if (isTeacherSet2Eligible(teacher)) return 2;
  if (isTeacherSet3Eligible(teacher)) return 3;
  return null;
};

export const isTeacherAssignedToCommittee = (teacher?: Teacher | null, committeeMember?: PaCommitteeMember | null): boolean => {
  if (!teacher || !committeeMember) return false;
  const teacherSet = getTeacherCommitteeSetNumber(teacher);
  const commSet = Number(committeeMember.setNumber) || 1;

  if (teacherSet === null || teacherSet !== commSet) {
    return false;
  }

  if (committeeMember.assignedTeacherIds && committeeMember.assignedTeacherIds.length > 0) {
    return committeeMember.assignedTeacherIds.includes(teacher.id);
  }

  return true;
};

export const INITIAL_PA_COMMITTEE: PaCommitteeMember[] = [
  // --- ชุดที่ 1: ประเมินวิทยฐานะ ครูชำนาญการ และครูชำนาญการพิเศษ ---
  {
    id: 'comm-1-1',
    order: 1,
    setNumber: 1,
    setName: 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ',
    targetDescription: 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ',
    name: 'นายอิทธิเดช สิทธิจันทร์',
    role: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดบางโฉลงใน',
    code: 'bch1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    phone: '02-337-1234 ต่อ 101',
    email: 'director@bangchalong.ac.th'
  },
  {
    id: 'comm-1-2',
    order: 2,
    setNumber: 1,
    setName: 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ',
    targetDescription: 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ',
    name: 'นายฐานุพงษ์ พุฒวิชัยดิษฐ์',
    role: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดกิ่งแก้ว(เทวะพัฒนาคาร)',
    code: 'bch2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    phone: '081-987-6543',
    email: 'thanupong.p@kingkaew.ac.th'
  },
  {
    id: 'comm-1-3',
    order: 3,
    setNumber: 1,
    setName: 'ชุดที่ 1: ประเมินครูชำนาญการ และครูชำนาญการพิเศษ',
    targetDescription: 'วิทยฐานะครูชำนาญการ และครูชำนาญการพิเศษ',
    name: 'นางสาวพันวลี ใจมั่น',
    role: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนสุเหร่าบางกระสี',
    code: 'bch3',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    phone: '086-555-4321',
    email: 'panwalee.j@bangkrasee.ac.th'
  },

  // --- ชุดที่ 2: ประเมิน ครู และครูผู้ช่วย ---
  {
    id: 'comm-2-1',
    order: 1,
    setNumber: 2,
    setName: 'ชุดที่ 2: ประเมินครู และครูผู้ช่วย',
    targetDescription: 'ตำแหน่งครู และครูผู้ช่วย',
    name: 'นายอิทธิเดช สิทธิจันทร์',
    role: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดบางโฉลงใน',
    code: 'bch1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    phone: '02-337-1234 ต่อ 101',
    email: 'director@bangchalong.ac.th'
  },
  {
    id: 'comm-2-2',
    order: 2,
    setNumber: 2,
    setName: 'ชุดที่ 2: ประเมินครู และครูผู้ช่วย',
    targetDescription: 'ตำแหน่งครู และครูผู้ช่วย',
    name: 'นายสัชฌุกร ตันติธนวรพงศ์',
    role: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดบางพลีใหญ่ใน',
    code: 'bch4',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    phone: '089-123-4567',
    email: 'satchukorn.t@bangpleeyainai.ac.th'
  },
  {
    id: 'comm-2-3',
    order: 3,
    setNumber: 2,
    setName: 'ชุดที่ 2: ประเมินครู และครูผู้ช่วย',
    targetDescription: 'ตำแหน่งครู และครูผู้ช่วย',
    name: 'นางยุพิน ป่าตาล',
    role: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดหัวคู้',
    code: 'bch5',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    phone: '084-567-8901',
    email: 'yupin.p@huakhoo.ac.th'
  },

  // --- ชุดที่ 3: ประเมิน ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ ---
  {
    id: 'comm-3-1',
    order: 1,
    setNumber: 3,
    setName: 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากรทางการศึกษา',
    targetDescription: 'ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ',
    name: 'นายอิทธิเดช สิทธิจันทร์',
    role: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    position: 'ผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดบางโฉลงใน',
    code: 'bch1',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    phone: '02-337-1234 ต่อ 101',
    email: 'director@bangchalong.ac.th'
  },
  {
    id: 'comm-3-2',
    order: 2,
    setNumber: 3,
    setName: 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากรทางการศึกษา',
    targetDescription: 'ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ',
    name: 'นางสาวอำพา ยะไม',
    role: 'กรรมการผู้แทนผู้บริหาร (รองผู้อำนวยการโรงเรียน)',
    position: 'รองผู้อำนวยการชำนาญการพิเศษ โรงเรียนวัดบางโฉลงใน',
    code: 'bch6',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    phone: '081-234-5678',
    email: 'ampa.y@bangchalong.ac.th'
  },
  {
    id: 'comm-3-3',
    order: 3,
    setNumber: 3,
    setName: 'ชุดที่ 3: ประเมินครูอัตราจ้าง และบุคลากรทางการศึกษา',
    targetDescription: 'ครูอัตราจ้าง, พี่เลี้ยงเด็กพิการ, นักการภารโรง, เจ้าหน้าที่ธุรการ',
    name: 'นางสาวสีจันทร์ สามงามพุ่ม',
    role: 'กรรมการผู้แทนผู้บริหาร (รองผู้อำนวยการโรงเรียน)',
    position: 'รองผู้อำนวยการชำนาญการ โรงเรียนวัดบางโฉลงใน',
    code: 'bch7',
    avatar: 'https://images.unsplash.com/photo-1580894732413-802c676d0811?q=80&w=400&auto=format&fit=crop',
    phone: '082-345-6789',
    email: 'seejan.s@bangchalong.ac.th'
  }
];

export const INITIAL_PA_EVALUATIONS: PaEvaluationRecord[] = [
  // --- การประเมินสำหรับชุดที่ 1 (ครูชำนาญการ / ชำนาญการพิเศษ) ---
  {
    id: 'eval_t-1_comm-1-1',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    committeeId: 'comm-1-1',
    committeeName: 'นายอิทธิเดช สิทธิจันทร์',
    committeeRole: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    docChecked: true,
    docCheckedAt: '2569-08-20 10:30',
    docFeedback: 'เอกสาร PA 1/ส ชัดเจน สอดคล้องกับมาตรฐานตำแหน่งและวิทยฐานะชำนาญการพิเศษ',
    videoChecked: true,
    videoCheckedAt: '2569-08-21 14:15',
    videoFeedback: 'การจัดกิจกรรมการเรียนรู้ Scratch มีการสร้างปฏิสัมพันธ์กับผู้เรียนได้เป็นอย่างดี ผู้เรียนมีส่วนร่วมสูง',
    overallStatus: 'excellent',
    overallScore: 92,
    overallComment: 'ผลการพัฒนางานตามข้อตกลงบรรลุเป้าหมายเชิงปริมาณและเชิงคุณภาพดีเยี่ยม',
    updatedAt: '2569-08-21 14:20'
  },
  {
    id: 'eval_t-1_comm-1-2',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    committeeId: 'comm-1-2',
    committeeName: 'นายฐานุพงษ์ พุฒวิชัยดิษฐ์',
    committeeRole: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    docChecked: true,
    docCheckedAt: '2569-08-22 09:45',
    docFeedback: 'แผนการจัดการเรียนรู้ Active Learning ถูกต้องตามหลักสูตรแกนกลางฯ',
    videoChecked: true,
    videoCheckedAt: '2569-08-22 11:20',
    videoFeedback: 'คลิปบรรยากาศการสอนมีคุณภาพ บรรลุตามจุดประสงค์การเรียนรู้',
    overallStatus: 'passed',
    overallScore: 88,
    overallComment: 'ผ่านเกณฑ์การประเมินตาม ว.PA',
    updatedAt: '2569-08-22 11:25'
  },
  {
    id: 'eval_t-1_comm-1-3',
    teacherId: 't-1',
    teacherName: 'ครูสมชาย ใจดี',
    committeeId: 'comm-1-3',
    committeeName: 'นางสาวพันวลี ใจมั่น',
    committeeRole: 'กรรมการผู้ทรงคุณวุฒิภายนอก',
    docChecked: true,
    docCheckedAt: '2569-08-23 13:00',
    docFeedback: 'เครื่องมือวัดและประเมินผลสอดคล้องกับตัวชี้วัด',
    videoChecked: true,
    videoCheckedAt: '2569-08-23 15:40',
    videoFeedback: 'สื่อใบงานและแพลตฟอร์ม Scratch เหมาะสมกับระดับชั้น ป.5',
    overallStatus: 'passed',
    overallScore: 90,
    overallComment: 'การดำเนินงานครบถ้วนสมบูรณ์',
    updatedAt: '2569-08-23 15:45'
  },
  {
    id: 'eval_t-2_comm-1-1',
    teacherId: 't-2',
    teacherName: 'ครูนภาวรรณ ศรีสุข',
    committeeId: 'comm-1-1',
    committeeName: 'นายอิทธิเดช สิทธิจันทร์',
    committeeRole: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    docChecked: true,
    docCheckedAt: '2569-08-24 11:00',
    docFeedback: 'ประเด็นท้าทายด้านคณิตศาสตร์สอดคล้องกับปัญหาการเรียนรู้จริง',
    videoChecked: true,
    videoCheckedAt: '2569-08-24 16:30',
    videoFeedback: 'เทคนิค Gamification ช่วยดึงดูดความสนใจของนักเรียนได้ดีมาก',
    overallStatus: 'excellent',
    overallScore: 94,
    overallComment: 'ขอชื่นชมในการนำนวัตกรรมเกมมาประยุกต์ใช้ในการสอนคณิตศาสตร์',
    updatedAt: '2569-08-24 16:35'
  },

  // --- การประเมินสำหรับชุดที่ 2 (ครู / ครูผู้ช่วย) ---
  {
    id: 'eval_t-3_comm-2-1',
    teacherId: 't-3',
    teacherName: 'ครูวิชัย พัฒนเมธา',
    committeeId: 'comm-2-1',
    committeeName: 'นายอิทธิเดช สิทธิจันทร์',
    committeeRole: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    docChecked: true,
    docCheckedAt: '2569-08-25 10:00',
    docFeedback: 'แผนการสอนภาษาอังกฤษ Phonics สอดคล้องกับมาตรฐานครูผู้ช่วย',
    videoChecked: true,
    videoCheckedAt: '2569-08-25 11:30',
    videoFeedback: 'กิจกรรมเพลงภาษาอังกฤษช่วยให้ผู้เรียนออกเสียงได้ถูกต้อง',
    overallStatus: 'passed',
    overallScore: 88,
    overallComment: 'มีความพร้อมและศักยภาพในการจัดการเรียนรู้',
    updatedAt: '2569-08-25 11:35'
  },

  // --- การประเมินสำหรับชุดที่ 3 (ครูอัตราจ้าง / บุคลากรทางการศึกษา) ---
  {
    id: 'eval_t-7_comm-3-1',
    teacherId: 't-7',
    teacherName: 'ครูชิดชนก ธนกุล',
    committeeId: 'comm-3-1',
    committeeName: 'นายอิทธิเดช สิทธิจันทร์',
    committeeRole: 'ประธานกรรมการ (ผู้อำนวยการสถานศึกษา)',
    docChecked: true,
    docCheckedAt: '2569-08-26 13:00',
    docFeedback: 'แผนการจัดประสบการณ์ปฐมวัยส่งเสริมพัฒนาการกล้ามเนื้อมือได้ดี',
    videoChecked: true,
    videoCheckedAt: '2569-08-26 14:20',
    videoFeedback: 'กิจกรรมปั้นดินน้ำมันสร้างความเพลิดเพลินและเสริมสมาธิเด็ก',
    overallStatus: 'passed',
    overallScore: 87,
    overallComment: 'ปฏิบัติหน้าที่ครูปฐมวัยได้เป็นอย่างดี',
    updatedAt: '2569-08-26 14:25'
  }
];
