import { useSyncExternalStore } from "react";
import { candidates, companies, contacts } from "./data";
import { removeContactFileData } from "./contact-file-storage";

const key = "hunter-company-contacts-v1";
const listeners = new Set();
const initial = {
  companies: companies.map((company) => ({ ...company })),
  contacts: contacts.map((contact) => ({
    ...contact,
    relationStatus: "当前",
    candidateId: "",
    timeline:
      contact.id === "contact-chenyu"
        ? [
            [
              "2026-08-20 18:20",
              "邮件回复",
              "确认 VLA 负责人岗位仍在招聘，希望先看 3 位高匹配候选人。",
              contact.email,
            ],
            [
              "2026-08-19 10:30",
              "电话沟通",
              "客户更关注真机数据闭环，纯研究背景优先级较低。",
              "沈岚",
            ],
            [
              "2026-08-12 14:10",
              "人工备注",
              "由启程资本刘健引荐，已完成首次沟通。",
              "沈岚",
            ],
          ]
        : [],
  })),
  deletedCompanies: [],
  purgedCompanies: [],
};
let state = initial;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (
    saved &&
    Array.isArray(saved.contacts) &&
    Array.isArray(saved.deletedCompanies)
  )
    state = { ...saved, companies: saved.companies || initial.companies };
} catch {
  /* Invalid demo state falls back to seed data. */
}

window.addEventListener("storage", (event) => {
  if (event.key !== key) return;
  try {
    const saved = event.newValue ? JSON.parse(event.newValue) : initial;
    if (
      !Array.isArray(saved.contacts) ||
      !Array.isArray(saved.deletedCompanies)
    )
      return;
    state = { ...saved, companies: saved.companies || initial.companies };
    listeners.forEach((listener) => listener());
  } catch {
    /* Keep the last valid state when another tab has invalid demo data. */
  }
});

function commit(next) {
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    throw new Error("本地保存失败，请检查浏览器存储空间后重试。");
  }
  state = next;
  listeners.forEach((listener) => listener());
}

export function useCompanyContacts() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

export const getCompanyContactSnapshot = () => state;

export function saveCompany(patch, id) {
  const current = id ? state.companies.find((company) => company.id === id) : null;
  if (id && (!current || state.deletedCompanies.includes(id)))
    throw new Error("公司不存在或已删除。");
  const name = (patch.name ?? current?.name)?.trim();
  if (!name) throw new Error("请输入公司名称。");
  if (state.companies.some((company) => company.id !== id &&
    !state.deletedCompanies.includes(company.id) && company.name.trim() === name))
    throw new Error("已有同名公司，请先核对现有公司资料。");
  const next = { ...current, ...patch, name, id: id || "company-" + crypto.randomUUID(),
    managed: true, updatedAt: new Date().toISOString() };
  commit({ ...state, companies: current ? state.companies.map((company) =>
    company.id === id ? next : company) : [...state.companies, next] });
  return next;
}

export const contactRoute = (contact) =>
  `/companies/${contact.companyId}/contacts/${contact.id}`;
export const companyContactsRoute = (companyId) =>
  `/companies/${companyId}?tab=contacts`;

export function saveContact(companyId, patch, id) {
  const company = state.companies.find((item) => item.id === companyId);
  if (!company || state.deletedCompanies.includes(companyId))
    throw new Error("所属公司不存在或已删除，请返回公司列表。");
  const current = id
    ? state.contacts.find(
        (item) =>
          item.id === id && item.companyId === companyId && !item.deletedAt,
      )
    : null;
  if (id && !current) throw new Error("联系人不存在或已删除。");
  const linkedCandidate =
    !id && patch.candidateId
      ? candidates.find((candidate) => candidate.id === patch.candidateId)
      : null;
  if (!id && patch.candidateId && !linkedCandidate)
    throw new Error("关联候选人不存在，请重新选择。");
  const next = {
    ...current,
    ...patch,
    ...(linkedCandidate
      ? {
          name: linkedCandidate.name,
          phone: linkedCandidate.phone,
          email: linkedCandidate.email,
          region: linkedCandidate.location,
          role: linkedCandidate.title,
        }
      : {}),
    companyId,
    company: company.name,
    id: id || `contact-${crypto.randomUUID()}`,
  };
  if (!next.name?.trim()) throw new Error("请输入姓名或明确称呼。");
  if (!next.categories?.length) throw new Error("请选择至少一个联系人类别。");
  if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email))
    throw new Error("邮箱格式不正确。");
  const duplicate = state.contacts.find(
    (item) =>
      item.id !== id &&
      item.companyId === companyId &&
      !item.deletedAt &&
      item.name === next.name.trim() &&
      ((next.candidateId && item.candidateId === next.candidateId) ||
        (next.email && item.email === next.email) ||
        (next.phone && item.phone === next.phone) ||
        (!next.email && !next.phone && item.role === next.role)),
  );
  if (duplicate)
    throw new Error("该公司下已存在相同身份的联系人，请编辑已有记录。");
  next.name = next.name.trim();
  commit({
    ...state,
    contacts: current
      ? state.contacts.map((item) => (item.id === id ? next : item))
      : [...state.contacts, { timeline: [], lastContact: "尚未沟通", ...next }],
  });
  return next;
}

export function recycleContact(id) {
  commit({
    ...state,
    contacts: state.contacts.map((item) =>
      item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item,
    ),
  });
}

export function recycleCompany(companyId) {
  commit({
    ...state,
    deletedCompanies: [...new Set([...state.deletedCompanies, companyId])],
    contacts: state.contacts.map((item) =>
      item.companyId === companyId && !item.deletedAt
        ? {
            ...item,
            deletedAt: new Date().toISOString(),
            deletedWithCompany: true,
          }
        : item,
    ),
  });
}

export async function restoreCompanyContact(item, permanently = false) {
  if (permanently) {
    const affected = state.contacts.filter((contact) =>
      item.type === "公司"
        ? contact.companyId === item.id
        : contact.id === item.id,
    );
    await removeContactFileData(
      affected.flatMap((contact) => contact.files || []),
    );
  }
  if (item.type === "公司") {
    commit({
      ...state,
      purgedCompanies: permanently
        ? [...(state.purgedCompanies || []), item.id]
        : state.purgedCompanies || [],
      deletedCompanies: permanently
        ? state.deletedCompanies
        : state.deletedCompanies.filter((id) => id !== item.id),
      contacts: permanently
        ? state.contacts.filter((contact) => contact.companyId !== item.id)
        : state.contacts.map((contact) =>
            contact.companyId === item.id && contact.deletedWithCompany
              ? { ...contact, deletedAt: null, deletedWithCompany: false }
              : contact,
          ),
    });
  } else {
    if (!permanently && state.deletedCompanies.includes(item.companyId))
      throw new Error("请先恢复所属公司，再恢复联系人。");
    commit({
      ...state,
      contacts: permanently
        ? state.contacts.filter((contact) => contact.id !== item.id)
        : state.contacts.map((contact) =>
            contact.id === item.id ? { ...contact, deletedAt: null } : contact,
          ),
    });
  }
}
