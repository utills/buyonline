'use client';

import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/stores/useLeadStore';
import { useHealthStore } from '@/stores/useHealthStore';
import MemberPersonalForm from '@/components/health/MemberPersonalForm';

export default function PersonalDetailsPage() {
  const router = useRouter();
  const { members } = useLeadStore();
  const { personalDetails, setPersonalDetails } = useHealthStore();
  const safeMembers = members ?? { self: true, spouse: false, kidsCount: 0 };
  const safePersonalDetails = personalDetails ?? {};

  const memberList = [];
  if (safeMembers.self) memberList.push({ id: 'self', label: 'Self' });
  if (safeMembers.spouse) memberList.push({ id: 'spouse', label: 'Spouse' });
  for (let i = 0; i < safeMembers.kidsCount; i++) {
    memberList.push({ id: `kid-${i + 1}`, label: `Kid ${i + 1}` });
  }

  const handleSave = (data: {
    memberId: string;
    title: string;
    firstName: string;
    lastName: string;
    mobile: string;
    dob: string;
    heightFt: number;
    heightIn: number;
    weightKg: number;
  }) => {
    setPersonalDetails(data.memberId, {
      memberId: data.memberId,
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      dob: data.dob,
      heightFt: data.heightFt,
      heightIn: data.heightIn,
      weightKg: data.weightKg,
    });
  };

  const allFilled = memberList.every((m) => safePersonalDetails[m.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Personal Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in details for each insured member
        </p>
      </div>

      {memberList.map((member) => (
        <MemberPersonalForm
          key={member.id}
          memberId={member.id}
          memberLabel={member.label}
          initialValues={
            safePersonalDetails[member.id]
              ? {
                  title: safePersonalDetails[member.id].title,
                  firstName: safePersonalDetails[member.id].firstName,
                  lastName: safePersonalDetails[member.id].lastName,
                  mobile: safePersonalDetails[member.id].mobile || '',
                  dob: safePersonalDetails[member.id].dob,
                  heightFt: safePersonalDetails[member.id].heightFt,
                  heightIn: safePersonalDetails[member.id].heightIn,
                  weightKg: safePersonalDetails[member.id].weightKg,
                }
              : undefined
          }
          onSave={handleSave}
        />
      ))}

      <button
        onClick={() => router.push('/bank')}
        disabled={!allFilled}
        className="w-full rounded-lg bg-[#ED1B2D] py-3 px-6 text-white font-semibold hover:bg-[#C8162A] disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
