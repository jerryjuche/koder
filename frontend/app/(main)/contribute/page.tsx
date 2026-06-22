"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContribution } from "@/lib/api";
import { toast } from "@/lib/toast";
import { PlusCircle, Trash2, Send } from "lucide-react";

export default function ContributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    statement: "",
    func_name: "",
    return_type: "",
    param_types: [""],
    hints: [""],
    difficulty: 1,
    xp_reward: 100,
    tags: [""],
    test_cases: [{ input: "", expected: "", is_hidden: false, ordinal: 1 }],
  });

  const resetForm = () => {
    setForm({
      slug: "",
      title: "",
      statement: "",
      func_name: "",
      return_type: "",
      param_types: [""],
      hints: [""],
      difficulty: 1,
      xp_reward: 100,
      tags: [""],
      test_cases: [{ input: "", expected: "", is_hidden: false, ordinal: 1 }],
    });
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Clean up empty array values
      const payload = {
        ...form,
        param_types: form.param_types.filter((t) => t.trim() !== ""),
        hints: form.hints.filter((h) => h.trim() !== ""),
        tags: form.tags.filter((t) => t.trim() !== ""),
        test_cases: form.test_cases.map((tc) => {
            let parsedInput;
            try {
                parsedInput = JSON.parse(tc.input);
            } catch (err) {
                // If it fails, we wrap it in array if it's not already
                parsedInput = [tc.input]; 
            }
            return {
                ...tc,
                input: parsedInput,
            };
        }),
      };

      const res = await submitContribution(payload);

      if (!res.success) {
        throw new Error(res.error?.message || "Failed to submit contribution");
      }

      toast.success("Contribution submitted successfully!");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-offwhite font-display">Submit a Contribution</h1>
        <p className="text-brand-offwhite-muted mt-2">
          Create a new problem to be reviewed by the ZeroJudge administrators. 
          Once approved, it will be visible to all students.
        </p>
      </div>

      {isSuccess ? (
        <Card className="bg-brand-charcoal-card border-brand-success/50 p-12 text-center shadow-lg shadow-brand-success/10 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-brand-success/20 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-brand-success" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-brand-offwhite mb-2">Contribution Submitted!</h2>
          <p className="text-brand-offwhite-muted mb-8 max-w-md mx-auto">
            Thank you for your contribution. An administrator will review your problem shortly.
            You will be notified once it is approved.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => router.push("/profile")} variant="outline" className="bg-transparent border-brand-charcoal-border hover:bg-brand-charcoal-hover">
              Return to Profile
            </Button>
            <Button onClick={resetForm} className="bg-brand-muted-gold text-brand-charcoal-base hover:bg-brand-muted-gold-dark">
              Submit Another Problem
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-md text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-brand-charcoal-card border-brand-charcoal-border">
          <CardHeader>
            <CardTitle className="text-brand-offwhite">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">Title</label>
                <Input 
                  required
                  placeholder="e.g. Reverse String"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">URL Slug</label>
                <Input 
                  required
                  placeholder="e.g. reverse-string"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">Difficulty (1-5)</label>
                <Input 
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">XP Reward</label>
                <Input 
                  type="number"
                  min={10}
                  step={10}
                  required
                  value={form.xp_reward}
                  onChange={(e) => setForm({ ...form, xp_reward: parseInt(e.target.value) || 100 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-offwhite-muted">Problem Statement (Markdown)</label>
              <Textarea 
                required
                rows={6}
                placeholder="Write the problem description here..."
                value={form.statement}
                onChange={(e) => setForm({ ...form, statement: e.target.value })}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-charcoal-card border-brand-charcoal-border">
          <CardHeader>
            <CardTitle className="text-brand-offwhite">Go Function Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">Function Name</label>
                <Input 
                  required
                  placeholder="e.g. Reverse"
                  value={form.func_name}
                  onChange={(e) => setForm({ ...form, func_name: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-offwhite-muted">Return Type</label>
                <Input 
                  required
                  placeholder="e.g. string"
                  value={form.return_type}
                  onChange={(e) => setForm({ ...form, return_type: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-offwhite-muted">Parameter Types (comma separated)</label>
              <Input 
                required
                placeholder="e.g. string, int"
                value={form.param_types.join(", ")}
                onChange={(e) => setForm({ ...form, param_types: e.target.value.split(",").map(s => s.trim()) })}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-brand-charcoal-card border-brand-charcoal-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-brand-offwhite">Test Cases</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForm({
                ...form,
                test_cases: [...form.test_cases, { input: "", expected: "", is_hidden: false, ordinal: form.test_cases.length + 1 }]
              })}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add Case
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.test_cases.map((tc, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-brand-charcoal-panel rounded-md border border-brand-charcoal-border">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-brand-offwhite-muted">Input (JSON array format `[arg1, arg2]`)</label>
                      <Input 
                        required
                        value={tc.input}
                        onChange={(e) => {
                          const newCases = [...form.test_cases];
                          newCases[index].input = e.target.value;
                          setForm({ ...form, test_cases: newCases });
                        }}
                        className="font-mono bg-brand-charcoal-base"
                        placeholder='e.g. ["hello"]'
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-brand-offwhite-muted">Expected Output (String)</label>
                      <Input 
                        required
                        value={tc.expected}
                        onChange={(e) => {
                          const newCases = [...form.test_cases];
                          newCases[index].expected = e.target.value;
                          setForm({ ...form, test_cases: newCases });
                        }}
                        className="font-mono bg-brand-charcoal-base"
                        placeholder="e.g. olleh"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={tc.is_hidden}
                      onChange={(e) => {
                        const newCases = [...form.test_cases];
                        newCases[index].is_hidden = e.target.checked;
                        setForm({ ...form, test_cases: newCases });
                      }}
                      id={`hidden-${index}`}
                      className="accent-brand-muted-gold"
                    />
                    <label htmlFor={`hidden-${index}`} className="text-sm text-brand-offwhite-muted">Hidden Test Case</label>
                  </div>
                </div>
                {form.test_cases.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newCases = form.test_cases.filter((_, i) => i !== index);
                      setForm({ ...form, test_cases: newCases.map((c, i) => ({ ...c, ordinal: i + 1 })) });
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" /> Submit for Review
              </>
            )}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
