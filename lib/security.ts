const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";

export const obfuscateId = (text: string): string => {
  if (!text) return "";
  try {
    const chars = text.split('').map((c, i) => {
      return c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    });
    return typeof btoa !== 'undefined' 
      ? btoa(String.fromCharCode(...chars)) 
      : Buffer.from(String.fromCharCode(...chars)).toString('base64');
  } catch (e) {
    return text;
  }
};

export const deobfuscateId = (encoded: string): string => {
  if (!encoded) return "";
  try {
    const text = typeof atob !== 'undefined' 
      ? atob(encoded) 
      : Buffer.from(encoded, 'base64').toString('ascii');
      
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    return chars.join('');
  } catch (e) {
    return "";
  }
};
