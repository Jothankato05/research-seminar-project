import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { X, Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalModalProps {
    isOpen: boolean;
    onClose: () => void;
    instanceName: string;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, instanceName }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerminal | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (isOpen && terminalRef.current && !xtermRef.current) {
            const term = new XTerminal({
                cursorBlink: true,
                theme: {
                    background: '#1a1a1a',
                    foreground: '#10b981',
                    cursor: '#10b981',
                    selectionBackground: 'rgba(16, 185, 129, 0.3)',
                },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalRef.current);
            fitAddon.fit();

            xtermRef.current = term;

            // Welcom Message
            term.writeln('\x1b[1;32mWelcome to V-CTRIP Forensic Terminal v1.0.0\x1b[0m');
            term.writeln(`\x1b[1;34mConnected to: ${instanceName}\x1b[0m`);
            term.writeln('\x1b[90mType "help" for available forensic commands.\x1b[0m');
            term.writeln('');
            term.write('\x1b[1;32manalyst@vctrip-lab\x1b[0m:\x1b[1;34m~\x1b[0m$ ');

            let currentLine = '';

            term.onData((data) => {
                const code = data.charCodeAt(0);
                if (code === 13) { // Enter
                    term.writeln('');
                    handleCommand(currentLine, term);
                    currentLine = '';
                    term.write('\x1b[1;32manalyst@vctrip-lab\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
                } else if (code === 127) { // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        term.write('\b \b');
                    }
                } else {
                    currentLine += data;
                    term.write(data);
                }
            });
        }

        return () => {
            if (!isOpen && xtermRef.current) {
                xtermRef.current.dispose();
                xtermRef.current = null;
            }
        };
    }, [isOpen, instanceName]);

    const handleCommand = (cmd: string, term: XTerminal) => {
        const command = cmd.trim().toLowerCase();
        if (command === 'help') {
            term.writeln('Available forensic tools:');
            term.writeln('  nmap [target]  - Network discovery');
            term.writeln('  whois [target] - Registry lookup');
            term.writeln('  apt install    - Install custom tools');
            term.writeln('  ls             - List current directory');
            term.writeln('  clear          - Clear terminal');
        } else if (command === 'ls') {
            term.writeln('README.md  forensics_tools/  evidence/  artifacts/');
        } else if (command.startsWith('apt install')) {
            const tool = command.replace('apt install', '').trim();
            if (!tool) {
                term.writeln('E: Package name missing');
            } else {
                term.writeln(`Reading package lists... Done`);
                term.writeln(`Building dependency tree... Done`);
                term.writeln(`The following NEW packages will be installed:`);
                term.writeln(`  ${tool}`);
                term.writeln(`0 upgraded, 1 newly installed, 0 to remove.`);
                term.writeln(`Need to get 1,402 kB of archives.`);
                term.writeln(`Get:1 http://archive.ubuntu.com/ubuntu jammy/main ${tool} [1,402 kB]`);
                term.writeln(`Unpacking ${tool}...`);
                term.writeln(`Setting up ${tool}...`);
                term.writeln(`\x1b[1;32mDone! ${tool} is now ready for use.\x1b[0m`);
            }
        } else if (command === 'whoami') {
            term.writeln('analyst');
        } else if (command === 'date') {
            term.writeln(new Date().toString());
        } else if (command === 'ps') {
            term.writeln('  PID TTY          TIME CMD');
            term.writeln(' 1234 pts/0    00:00:00 bash');
            term.writeln(' 5678 pts/0    00:00:00 ps');
            term.writeln(' 9012 pts/0    00:00:15 forensics_engine');
        } else if (command === 'df -h') {
            term.writeln('Filesystem      Size  Used Avail Use% Mounted on');
            term.writeln('overlay          40G   12G   28G  30% /');
            term.writeln('tmpfs            64M     0   64M   0% /dev');
            term.writeln('/dev/sda1        40G   12G   28G  30% /etc/hosts');
        } else if (command === 'cat readme.md') {
            term.writeln('\x1b[1;34m# V-CTRIP FORENSIC SANDBOX v1.0.0\x1b[0m');
            term.writeln('This environment is strictly for evidence analysis.');
            term.writeln('All activities are logged to the central audit system.');
            term.writeln('\x1b[33mCAUTION:\x1b[0m Do not execute malware without isolation confirmed.');
        } else if (command === 'clear') {
            term.clear();
        } else if (command === '') {
            // Do nothing
        } else {
            term.writeln(`-vctrip-bash: ${command}: command not found`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed z-[200] transition-all duration-300 flex flex-col bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden ${isMaximized ? 'inset-0' : 'bottom-6 right-6 w-[800px] h-[500px]'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-secondary border-b border-white/5 cursor-move">
                <div className="flex items-center gap-3">
                    <TerminalIcon className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Forensic Shell | {instanceName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-gray-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div ref={terminalRef} className="flex-1 p-4 bg-[#1a1a1a]" />
        </div>
    );
};
