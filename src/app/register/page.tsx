"use client";

import * as React from "react";
import Link from "next/link";
import { Scissors, ArrowLeft, User, Mail, Lock, FileText, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format, parse, isValid, getMonth, getYear, setMonth, setYear, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatCPF, formatDateInput, validateCPF } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { registerUser, checkEmailAvailability } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [date, setDate] = React.useState<Date>();
    const [inputValue, setInputValue] = React.useState("");
    const [cpfValue, setCpfValue] = React.useState("");

    // Estados para validação
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});
    const [emailChecking, setEmailChecking] = React.useState(false);
    const [emailAvailable, setEmailAvailable] = React.useState<boolean | null>(null);

    // Estado para controlar o mês exibido no calendário
    const [month, setMonthState] = React.useState<Date>(new Date());

    // Atualiza o input quando uma data é selecionada no calendário
    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            setInputValue(format(selectedDate, "dd/MM/yyyy"));
            setMonthState(selectedDate);
            setErrors(prev => ({ ...prev, birthDate: "" }));
        } else {
            setInputValue("");
        }
    };

    // Atualiza a data quando o usuário digita
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = formatDateInput(e.target.value);
        setInputValue(value);

        if (value.length === 10) {
            const parsedDate = parse(value, "dd/MM/yyyy", new Date());
            if (isValid(parsedDate)) {
                setDate(parsedDate);
                setMonthState(parsedDate);
                setErrors(prev => ({ ...prev, birthDate: "" }));
            } else {
                setDate(undefined);
            }
        } else {
            setDate(undefined);
        }
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = formatCPF(e.target.value);
        setCpfValue(value);
        if (errors.cpf) setErrors(prev => ({ ...prev, cpf: "" }));
    };

    // Função de validação genérica
    const validateField = async (name: string, value: string) => {
        let error = "";

        switch (name) {
            case "name":
                if (value.length < 3) error = "Nome deve ter no mínimo 3 caracteres.";
                break;
            case "cpf":
                if (!validateCPF(value)) error = "CPF inválido.";
                break;
            case "email":
                if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    error = "Email inválido.";
                } else {
                    setEmailChecking(true);
                    const isTaken = await checkEmailAvailability(value);
                    setEmailChecking(false);
                    if (isTaken) {
                        error = "Este email já está cadastrado.";
                        setEmailAvailable(false);
                    } else {
                        setEmailAvailable(true);
                    }
                }
                break;
            case "password":
                if (value.length < 6) error = "A senha deve ter no mínimo 6 caracteres.";
                break;
            case "confirmPassword":
                const password = (document.getElementById("password") as HTMLInputElement).value;
                if (value !== password) error = "As senhas não coincidem.";
                break;
            case "birthDateInput":
                if (value.length === 10) {
                    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
                    if (!isValid(parsedDate)) error = "Data inválida.";
                } else if (value.length > 0) {
                    error = "Data incompleta.";
                }
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        await validateField(name, value);
    };

    async function handleSubmit(formData: FormData) {
        // Validação final antes de enviar
        const name = formData.get("name") as string;
        const cpf = formData.get("cpf") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        const nameError = await validateField("name", name);
        const cpfError = await validateField("cpf", cpf);
        const emailError = await validateField("email", email);
        const passwordError = await validateField("password", password);
        const confirmError = await validateField("confirmPassword", confirmPassword);

        // Validação de data
        let dateError = "";
        if (!date) {
            dateError = "Data de nascimento é obrigatória.";
            setErrors(prev => ({ ...prev, birthDate: dateError }));
        }

        if (nameError || cpfError || emailError || passwordError || confirmError || dateError) {
            toast.error("Por favor, corrija os erros antes de continuar.");
            return;
        }

        setIsLoading(true);

        if (date) {
            formData.set("birthDate", date.toISOString());
        }

        const result = await registerUser(null, formData);

        if (result?.error) {
            toast.error(result.error);
            setIsLoading(false);
        }
    }

    // Geração de anos (1900 até ano atual)
    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 1900; i--) {
            years.push(i);
        }
        return years;
    }, []);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const handleMonthChange = (value: string) => {
        const newMonth = setMonth(month, months.indexOf(value));
        setMonthState(newMonth);
    };

    const handleYearChange = (value: string) => {
        const newMonth = setYear(month, parseInt(value));
        setMonthState(newMonth);
    };

    const nextMonth = () => setMonthState(addMonths(month, 1));
    const prevMonth = () => setMonthState(subMonths(month, 1));

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center">
                        <Link href="/" className="flex items-center gap-2 group mb-8">
                            <div className="bg-white text-black p-2 rounded-lg group-hover:bg-yellow-500 transition-colors">
                                <Scissors size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tighter">
                                Barber<span className="text-yellow-500">SaaS</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Crie sua conta
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Comece a gerenciar sua barbearia hoje mesmo.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="mt-8 space-y-6">
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-300">
                                    Nome Completo
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <User size={18} />
                                    </div>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Seu nome"
                                        type="text"
                                        className={cn(
                                            "pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                            errors.name && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        required
                                        onBlur={handleBlur}
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf" className="text-zinc-300">
                                        CPF
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                            <FileText size={18} />
                                        </div>
                                        <Input
                                            id="cpf"
                                            name="cpf"
                                            placeholder="000.000.000-00"
                                            value={cpfValue}
                                            onChange={handleCpfChange}
                                            onBlur={handleBlur}
                                            className={cn(
                                                "pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                                errors.cpf && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                            required
                                            maxLength={14}
                                        />
                                    </div>
                                    {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                                </div>

                                <div className="space-y-2 flex flex-col">
                                    <Label className="text-zinc-300">Nascimento</Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="DD/MM/AAAA"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={cn(
                                                "pl-3 pr-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                                errors.birthDate && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                            maxLength={10}
                                            name="birthDateInput"
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-yellow-500 transition-colors focus:outline-none"
                                                >
                                                    <CalendarIcon size={18} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3 bg-zinc-950 border-zinc-800" align="center">
                                                {/* Custom Header */}
                                                <div className="flex items-center justify-between mb-4 gap-2">
                                                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <div className="flex gap-2">
                                                        <Select value={months[getMonth(month)]} onValueChange={handleMonthChange}>
                                                            <SelectTrigger className="h-8 w-[110px] bg-zinc-900 border-zinc-800 text-white text-xs focus:ring-yellow-500 [&>svg]:hidden justify-center">
                                                                <SelectValue placeholder="Mês" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                                                                {months.map((m) => (
                                                                    <SelectItem key={m} value={m} className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">
                                                                        {m}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Select value={getYear(month).toString()} onValueChange={handleYearChange}>
                                                            <SelectTrigger className="h-8 w-[80px] bg-zinc-900 border-zinc-800 text-white text-xs focus:ring-yellow-500 [&>svg]:hidden justify-center">
                                                                <SelectValue placeholder="Ano" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                                                                {years.map((y) => (
                                                                    <SelectItem key={y} value={y.toString()} className="text-xs focus:bg-zinc-800 focus:text-white cursor-pointer">
                                                                        {y}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={handleDateSelect}
                                                    month={month}
                                                    onMonthChange={setMonthState}
                                                    showOutsideDays={false}
                                                    disabled={(date: Date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    locale={ptBR}
                                                    className="text-white p-0"
                                                    classNames={{
                                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                                        month: "space-y-4",
                                                        month_grid: "w-full border-collapse space-y-1 mx-auto",
                                                        caption: "hidden",
                                                        caption_label: "hidden",
                                                        nav: "hidden",
                                                        weekdays: "mb-2",
                                                        weekday: "text-zinc-500 font-normal text-[0.8rem] w-10 h-10",
                                                        week: "mt-2",
                                                        day: "p-0 text-center",
                                                        day_button: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 hover:text-white rounded-md text-zinc-300 flex items-center justify-center",
                                                        day_selected: "bg-yellow-500 text-black hover:bg-yellow-400 hover:text-black focus:bg-yellow-500 focus:text-black",
                                                        day_today: "bg-zinc-800 text-white font-bold",
                                                        day_outside: "!text-zinc-700 !opacity-30",
                                                        day_disabled: "text-zinc-700 opacity-50",
                                                        day_hidden: "invisible",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {errors.birthDate && <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">
                                    Email
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="seu@email.com"
                                        type="email"
                                        onBlur={handleBlur}
                                        className={cn(
                                            "pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                            errors.email && "border-red-500 focus-visible:ring-red-500",
                                            emailAvailable === true && "border-green-500 focus-visible:ring-green-500"
                                        )}
                                        required
                                    />
                                    {emailChecking && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-500">
                                            <Loader2 size={16} className="animate-spin" />
                                        </div>
                                    )}
                                    {!emailChecking && emailAvailable === true && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-green-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-300">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        type="password"
                                        onBlur={handleBlur}
                                        className={cn(
                                            "pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                            errors.password && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-zinc-300">
                                    Confirmar Senha
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        type="password"
                                        onBlur={handleBlur}
                                        className={cn(
                                            "pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500",
                                            errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || Object.values(errors).some(e => e)}
                                className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-11 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="bg-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-zinc-500">
                                    Ou continue com
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white h-11">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            Entrar com Google
                        </Button>

                        <p className="text-center text-sm text-zinc-400">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
                                Faça login
                            </Link>
                        </p>
                    </div>

                    <div className="pt-8 text-center">
                        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
                            <ArrowLeft size={16} className="mr-2" />
                            Voltar para o início
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative bg-zinc-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>
                <div className="relative h-full flex flex-col justify-end p-12 text-white">
                    <div className="max-w-md space-y-4">
                        <blockquote className="text-2xl font-medium leading-relaxed">
                            "Transformou completamente a forma como gerencio minha equipe. Profissionalismo em outro nível."
                        </blockquote>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-500">
                                JS
                            </div>
                            <div>
                                <div className="font-bold">João Silva</div>
                                <div className="text-sm text-zinc-400">Barbearia Silva & Co.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
