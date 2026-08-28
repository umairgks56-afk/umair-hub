import type { Course, DataStore, Material } from "./schema";

const courses = new Map<string, Course>();
const materials = new Map<string, Material>();
const id = () => crypto.randomUUID();

export const memoryStore: DataStore = {
  async createCourse(input) {
    const course = { ...input, id: id(), createdAt: new Date().toISOString() };
    courses.set(course.id, course);
    return course;
  },
  async createMaterial(input) {
    const material = { ...input, id: id(), createdAt: new Date().toISOString() };
    materials.set(material.id, material);
    return material;
  },
  async getCourse(courseId) { return courses.get(courseId) ?? null; },
  async listMaterials(courseId) { return [...materials.values()].filter((m) => m.courseId === courseId); },
};
