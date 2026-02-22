'use client';

interface MemberChip {
  id: string;
  label: string;
}

interface MemberChipSelectorProps {
  members: MemberChip[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
}

export default function MemberChipSelector({
  members,
  selectedIds,
  onToggle,
}: MemberChipSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {members.map((member) => {
        const isSelected = selectedIds.includes(member.id);
        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onToggle(member.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              isSelected
                ? 'bg-[#E31837] text-white border-[#E31837]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#E31837] hover:text-[#E31837]'
            }`}
          >
            {member.label}
          </button>
        );
      })}
    </div>
  );
}
