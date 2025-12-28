"use client";

import { FormEvent, useState } from "react";
import { Building2, Loader2, PlusCircle, RefreshCcw } from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";

interface WorkspaceGateProps {
  children: React.ReactNode;
}

export function WorkspaceGate({ children }: WorkspaceGateProps) {
  const {
    workspaces,
    activeWorkspaceId,
    isLoading,
    isSaving,
    error,
    hasInitialized,
    createWorkspace,
    setActiveWorkspace,
    fetchWorkspaces,
    resetError,
  } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = workspaceName.trim();
    if (!trimmed) {
      return;
    }

    const created = await createWorkspace({ name: trimmed });
    if (created) {
      setWorkspaceName("");
    }
  };

  if (!hasInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Loading workspaces
          </p>
        </div>
      </div>
    );
  }

  if (hasInitialized && workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Workspace required</p>
              <h1 className="mt-3 text-2xl font-semibold">Create your first workspace</h1>
              <p className="mt-2 text-sm text-slate-300">
                Workspaces keep teams, rituals, and sessions scoped correctly. Create one to continue.
              </p>
            </div>
          </div>
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Workspace name
              </label>
              <input
                value={workspaceName}
                onChange={(event) => {
                  if (error) {
                    resetError();
                  }
                  setWorkspaceName(event.target.value);
                }}
                placeholder="Eg. Northwind Engineering"
                className="mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            {error && (
              <p className="text-xs text-red-300">{error}</p>
            )}
            <button
              type="submit"
              disabled={!workspaceName.trim() || isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/60 bg-blue-500/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-blue-50 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              <span>{isSaving ? "Creating workspace" : "Create workspace"}</span>
            </button>
            <button
              type="button"
              onClick={() => fetchWorkspaces().catch(() => {})}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry sync
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (workspaces.length > 0 && !activeWorkspaceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Select workspace</p>
            <h1 className="text-2xl font-semibold">Choose a workspace to continue</h1>
            <p className="text-sm text-slate-300">
              You belong to multiple workspaces. Pick one to scope all data and API calls.
            </p>
          </div>
          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </div>
          )}
          <div className="mt-4 space-y-3">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => setActiveWorkspace(workspace.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-left transition hover:border-blue-500/60"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{workspace.name}</p>
                  <p className="text-xs text-slate-400">
                    Created {new Date(workspace.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-300">
                  Use workspace
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fetchWorkspaces().catch(() => {})}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-blue-500/60 hover:text-blue-200"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh list
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
