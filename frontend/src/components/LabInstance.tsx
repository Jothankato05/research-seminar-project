import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import {
    Cpu,
    Terminal,
    Shield,
    Server,
    Zap,
    Power,
    Network,
    Copy,
    Check,
    Loader2,
    Activity
} from 'lucide-react';

import { TerminalModal } from './TerminalModal';

interface Instance {
    id: string;
    name: string;
    osType: string;
    osVersion: string;
    region?: string;
    targetIp: string;
    sshCommand: string;
    status: 'PROVISIONING' | 'RUNNING' | 'STOPPED' | 'TERMINATED';
}

interface LabInstanceProps {
    reportId: string;
    existingInstance?: Instance | null;
}

export const LabInstance = ({ reportId, existingInstance }: LabInstanceProps) => {
    const [instance, setInstance] = useState<Instance | null>(existingInstance || null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [provisioningProgress, setProvisioningProgress] = useState(0);
    const [provisioningStep, setProvisioningStep] = useState('Initializing SOC Infrastructure...');

    useEffect(() => {
        let timer: any;
        if (instance?.status === 'PROVISIONING') {
            const steps = [
                { p: 15, s: 'Allocating isolated compute resources...' },
                { p: 35, s: 'Pulling forensics image: Ubuntu 22.04 LTS...' },
                { p: 60, s: 'Generating ephemeral SSH credentials...' },
                { p: 85, s: 'Configuring sandbox firewall policies...' },
                { p: 95, s: 'Instance boot-sequence in progress...' }
            ];

            let currentStepIdx = 0;
            timer = setInterval(() => {
                if (currentStepIdx < steps.length) {
                    setProvisioningProgress(steps[currentStepIdx].p);
                    setProvisioningStep(steps[currentStepIdx].s);
                    currentStepIdx++;
                }
            }, 2500);
        }
        return () => clearInterval(timer);
    }, [instance?.status]);

    useEffect(() => {
        let interval: any;
        if (instance?.status === 'PROVISIONING') {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`/labs/${instance.id}`);
                    setInstance(res.data);
                    if (res.data.status === 'RUNNING') {
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error('Polling failed', e);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [instance?.status, instance?.id]);

    const spawnInstance = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`/labs/spawn/${reportId}`);
            setInstance(res.data);
        } catch (e) {
            console.error('Spawn failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const terminateInstance = async () => {
        if (!instance) return;
        setIsLoading(true);
        try {
            await axios.delete(`/labs/${instance.id}`);
            setInstance({ ...instance, status: 'TERMINATED' });
        } catch (e) {
            console.error('Termination failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!instance || instance.status === 'TERMINATED') {
        return (
            <div className="p-8 glass-card rounded-[2.5rem] border-dashed border-2 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 text-primary/40 group">
                    <Server className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-lg font-black text-secondary mb-2">Discovery Lab Instance</h4>
                <p className="text-sm text-gray-500 max-w-xs mb-8 font-medium">
                    Deploy a dedicated secure sandbox environment to investigate malware or analyze phishing artifacts.
                </p>
                <Button
                    className="rounded-2xl px-8 py-6 bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em]"
                    onClick={spawnInstance}
                    isLoading={isLoading}
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Spawn Investigation Instance
                </Button>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/40">
            {/* Instance Header */}
            <div className="p-8 bg-secondary/5 border-b border-white/40">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${instance.status === 'RUNNING' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-primary/10 text-primary'}`}>
                            {instance.status === 'PROVISIONING' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Cpu className="w-6 h-6" />}
                        </div>
                        <div>
                            <h4 className="font-black text-secondary leading-none">{instance.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`w-2 h-2 rounded-full ${instance.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-primary animate-bounce'}`}></span>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    {instance.status} • {instance.region || 'VERITAS-NG-WEST-1'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 py-2.5 px-4 text-[10px] font-black uppercase tracking-widest"
                        onClick={terminateInstance}
                        isLoading={isLoading}
                    >
                        <Power className="w-3 h-3 mr-2" />
                        Teardown
                    </Button>
                </div>
            </div>

            {/* Instance Details */}
            <div className="p-8 space-y-6">
                {instance.status === 'PROVISIONING' ? (
                    <div className="space-y-6 py-6">
                        <div className="flex justify-between items-end mb-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Deployment Status</p>
                                <p className="text-sm font-black text-secondary">{provisioningStep}</p>
                            </div>
                            <span className="text-xl font-black text-primary">{provisioningProgress}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-100">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-700 relative"
                                style={{ width: `${provisioningProgress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-colors duration-500 ${provisioningProgress > (i * 30) ? 'bg-primary' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Network className="w-3 h-3" /> External IPv4
                                </p>
                                <p className="text-sm font-black text-secondary font-mono">{instance.targetIp}</p>
                            </div>
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Shield className="w-3 h-3" /> System OS
                                </p>
                                <p className="text-sm font-black text-secondary">{instance.osType} {instance.osVersion}</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                className="flex-1 rounded-2xl bg-secondary text-white py-4 font-black text-[10px] uppercase tracking-widest shadow-xl"
                                onClick={() => setIsTerminalOpen(true)}
                            >
                                <Terminal className="w-4 h-4 mr-2" />
                                Launch Web Console
                            </Button>
                            <div className="flex-1 flex items-center gap-3 p-4 bg-gray-50 text-gray-500 rounded-2xl font-mono text-[10px] group relative border border-gray-100">
                                <span className="flex-1 overflow-hidden overflow-ellipsis">{instance.sshCommand}</span>
                                <button
                                    onClick={() => copyToClipboard(instance.sshCommand)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                                {copied && <span className="absolute -top-8 right-0 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Copied!</span>}
                            </div>
                        </div>

                        <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-emerald-500" />
                                <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Instance Health</h5>
                            </div>
                            <div className="flex gap-1.5 h-6 items-end">
                                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.5, 0.3, 0.6, 0.8, 0.7].map((h, i) => (
                                    <div key={i} className="flex-1 bg-emerald-500/40 rounded-sm animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 100}ms` }}></div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Terminal Interface */}
            <TerminalModal
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
                instanceName={instance.name}
            />
        </div>
    );
};
