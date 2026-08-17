const API_URL =
  "https://script.google.com/macros/s/AKfycbybmtgOSRdz09rpOrbuccFDWuj85aGAju-jV3kmL4IwVGl-tLnrXj9LdI356tPooYcRrw/exec";

export type Member = {
  id?: string;
  name: string;
  phone: string;
  fullPhone?: string;
  experience?: string;
  memo?: string;
  createdAt?: string;
};

export type AttendanceRecord = {
  memberId?: string;
  name: string;
  phone: string;
  date: string;
  classTitle?: string;
};

export type MainSettings = {
  todayMessage: string;
  classTitle: string;
  classContent: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

type RegisterMemberResult = {
  registered: boolean;
  alreadyExists: boolean;
  member: Member;
};

type CheckMemberResult = {
  found: boolean;
  member: Member | null;
};

type AddAttendanceResult = {
  attended: boolean;
  alreadyAttended: boolean;
  record?: AttendanceRecord;
};

type DashboardData = {
  members: Member[];
  attendance: AttendanceRecord[];
  settings: MainSettings;
  classes: Array<{
    date: string;
    title: string;
    content: string;
    attendanceCount: number;
    createdAt: string;
  }>;
};

type CancelAttendanceResult = {
  cancelled: boolean;
};

async function request<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  if (
    !API_URL ||
    API_URL.includes("여기에_Apps_Script")
  ) {
    throw new Error(
      "googleSheet.ts에 Apps Script 웹 앱 URL을 입력해주세요."
    );
  }

  const response = await fetch(API_URL, {
    method: "POST",

    /*
     * application/json으로 보내면 브라우저가 사전 요청을 보낼 수 있어
     * Apps Script 연결이 막히는 경우가 있습니다.
     * text/plain으로 보내고 내용은 JSON으로 전달합니다.
     */
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },

    body: JSON.stringify({
      action,
      ...payload,
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `서버 연결에 실패했습니다. (${response.status})`
    );
  }

  const result = (await response.json()) as ApiResponse<T>;

  if (!result.success) {
    throw new Error(
      result.message || "요청 처리 중 오류가 발생했습니다."
    );
  }

  if (result.data === undefined) {
    throw new Error("서버에서 데이터를 받지 못했습니다.");
  }

  return result.data;
}

/**
 * 새 회원을 Google Sheets에 등록합니다.
 */
export async function registerMember(
  member: Omit<Member, "id" | "createdAt">
): Promise<RegisterMemberResult> {
  return request<RegisterMemberResult>(
    "registerMember",
    member
  );
}

/**
 * 닉네임과 전화번호 마지막 4자리로 회원을 확인합니다.
 */
export async function checkMember(
  name: string,
  phone: string
): Promise<CheckMemberResult> {
  return request<CheckMemberResult>("checkMember", {
    name,
    phone,
  });
}

/**
 * 회원의 출석 기록을 Google Sheets에 추가합니다.
 */
export async function addAttendance(
  attendance: {
    memberId?: string;
    name: string;
    phone: string;
    classTitle: string;
  }
): Promise<AddAttendanceResult> {
  return request<AddAttendanceResult>(
    "addAttendance",
    attendance
  );
}

/**
 * 전체 회원을 불러옵니다.
 */
export async function getMembers(): Promise<Member[]> {
  return request<Member[]>("getMembers");
}

/**
 * 전체 출석 기록을 불러옵니다.
 */
export async function getAttendance(): Promise<
  AttendanceRecord[]
> {
  return request<AttendanceRecord[]>("getAttendance");
}

/**
 * 관리자 대시보드에 필요한 데이터를 한 번에 불러옵니다.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return request<DashboardData>("getDashboardData");
}

/**
 * 오늘의 한마디와 오늘의 수업 정보를 저장합니다.
 */
export async function saveMainSettings(
  settings: MainSettings
): Promise<MainSettings> {
  return request<MainSettings>(
    "saveMainSettings",
    settings
  );
}

/**
 * 메인화면에 표시할 설정을 불러옵니다.
 */
export async function getMainSettings(): Promise<MainSettings> {
  return request<MainSettings>("getMainSettings");
}

/**
 * 출석 기록을 취소합니다.
 */
export async function cancelAttendance(
  record: AttendanceRecord
): Promise<CancelAttendanceResult> {
  return request<CancelAttendanceResult>(
    "cancelAttendance",
    {
      memberId: record.memberId || "",
      name: record.name,
      phone: record.phone,
      date: record.date,
    }
  );
}
type DeleteMemberResult = {
  deleted: boolean;
  deletedAttendanceCount: number;
};

/**
 * 회원과 해당 회원의 출석 기록을 Google Sheets에서 삭제합니다.
 */
export async function deleteMember(member: {
  id?: string;
  name: string;
  phone: string;
}): Promise<DeleteMemberResult> {
  return request<DeleteMemberResult>("deleteMember", {
    memberId: member.id || "",
    name: member.name,
    phone: member.phone,
  });
}
