"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Barbershop } from "@prisma/client";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon, WhatsAppIcon } from "@/components/social-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsFormProps {
    settings: Barbershop;
}

export function SettingsForm({ settings }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);

    // Form states
    const [name, setName] = useState(settings.name || "");
    const [phone, setPhone] = useState(settings.phone || "");
    const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Address states
    const [cep, setCep] = useState(settings.cep || "");
    const [street, setStreet] = useState(settings.street || "");
    const [number, setNumber] = useState(settings.number || "");
    const [complement, setComplement] = useState(settings.complement || "");
    const [neighborhood, setNeighborhood] = useState(settings.neighborhood || "");
    const [city, setCity] = useState(settings.city || "");
    const [state, setState] = useState(settings.state || "");

    // Hours states
    const [weekDaysOpen, setWeekDaysOpen] = useState(settings.weekDaysOpen || "09:00");
    const [weekDaysClose, setWeekDaysClose] = useState(settings.weekDaysClose || "20:00");
    const [saturdayOpen, setSaturdayOpen] = useState(settings.saturdayOpen || "09:00");
    const [saturdayClose, setSaturdayClose] = useState(settings.saturdayClose || "18:00");
    const [sundayOpen, setSundayOpen] = useState(settings.sundayOpen || "");
    const [sundayClose, setSundayClose] = useState(settings.sundayClose || "");

    // Social Media States
    const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || "");
    const [instagramActive, setInstagramActive] = useState(settings.instagramActive || false);
    const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || "");
    const [facebookActive, setFacebookActive] = useState(settings.facebookActive || false);
    const [twitterUrl, setTwitterUrl] = useState(settings.twitterUrl || "");
    const [twitterActive, setTwitterActive] = useState(settings.twitterActive || false);
    const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || "");
    const [tiktokActive, setTiktokActive] = useState(settings.tiktokActive || false);
    const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl || "");
    const [whatsappActive, setWhatsappActive] = useState(settings.whatsappActive || false);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const url = URL.createObjectURL(file);
            setLogoUrl(url);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, "($1");
        }

        setPhone(value);
    };

    async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
        const newCep = e.target.value.replace(/\D/g, "");
        if (newCep.length === 8) {
            setCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setState(data.uf);
                    toast.success("Endereço encontrado!");
                } else {
                    toast.error("CEP não encontrado.");
                }
            } catch (error) {
                toast.error("Erro ao buscar CEP.");
            } finally {
                setCepLoading(false);
            }
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Append switch values manually because unchecked checkboxes don't send data
            if (instagramActive) formData.set("instagramActive", "on");
            if (facebookActive) formData.set("facebookActive", "on");
            if (twitterActive) formData.set("twitterActive", "on");
            if (tiktokActive) formData.set("tiktokActive", "on");
            if (whatsappActive) formData.set("whatsappActive", "on");
            if (logoFile) formData.set("logoFile", logoFile);

            const result = await updateSettings(formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Configurações salvas com sucesso!");
            }
        } catch (error) {
            toast.error("Erro inesperado ao salvar configurações.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Form Column */}
            <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
                <CardHeader>
                    <CardTitle>Editar Informações</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <input type="hidden" name="barbershopId" value={settings.id} />
                        <div className="space-y-2">
                            <Label>Logo da Barbearia</Label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-zinc-500">Sem Logo</span>
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                />
                            </div>
                            <p className="text-xs text-zinc-500">Recomendado: Imagem quadrada (PNG ou JPG).</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Barbearia</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={phone}
                                onChange={handlePhoneChange}
                                maxLength={15}
                                className="bg-zinc-800 border-zinc-700 text-white"
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="border-t border-zinc-800 pt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP</Label>
                                    <div className="relative">
                                        <Input
                                            id="cep"
                                            name="cep"
                                            value={cep}
                                            onChange={(e) => setCep(e.target.value)}
                                            onBlur={handleCepBlur}
                                            maxLength={9}
                                            className="bg-zinc-800 border-zinc-700 text-white pr-10"
                                            placeholder="00000-000"
                                        />
                                        {cepLoading && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="street">Logradouro</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="number">Número</Label>
                                    <Input
                                        id="number"
                                        name="number"
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                    <Label htmlFor="complement">Complemento</Label>
                                    <Input
                                        id="complement"
                                        name="complement"
                                        value={complement}
                                        onChange={(e) => setComplement(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="neighborhood">Bairro</Label>
                                    <Input
                                        id="neighborhood"
                                        name="neighborhood"
                                        value={neighborhood}
                                        onChange={(e) => setNeighborhood(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">Estado (UF)</Label>
                                    <Input
                                        id="state"
                                        name="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Horário de Funcionamento (Exibição)</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <Label className="col-span-1">Segunda a Sexta</Label>
                                    <Input
                                        type="time"
                                        name="weekDaysOpen"
                                        value={weekDaysOpen}
                                        onChange={(e) => setWeekDaysOpen(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Input
                                        type="time"
                                        name="weekDaysClose"
                                        value={weekDaysClose}
                                        onChange={(e) => setWeekDaysClose(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <Label className="col-span-1">Sábado</Label>
                                    <Input
                                        type="time"
                                        name="saturdayOpen"
                                        value={saturdayOpen}
                                        onChange={(e) => setSaturdayOpen(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Input
                                        type="time"
                                        name="saturdayClose"
                                        value={saturdayClose}
                                        onChange={(e) => setSaturdayClose(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <Label className="col-span-1">Domingo</Label>
                                    <Input
                                        type="time"
                                        name="sundayOpen"
                                        value={sundayOpen}
                                        onChange={(e) => setSundayOpen(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Input
                                        type="time"
                                        name="sundayClose"
                                        value={sundayClose}
                                        onChange={(e) => setSundayClose(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">Deixe os horários de Domingo em branco se estiver fechado.</p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Redes Sociais</h3>
                            <div className="space-y-6">
                                {/* Instagram */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <InstagramIcon className="w-5 h-5 text-pink-500" />
                                        <Label htmlFor="instagramUrl">Instagram</Label>
                                    </div>
                                    <Input
                                        id="instagramUrl"
                                        name="instagramUrl"
                                        value={instagramUrl}
                                        onChange={(e) => setInstagramUrl(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                        placeholder="https://instagram.com/..."
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="instagramActive"
                                            checked={instagramActive}
                                            onCheckedChange={setInstagramActive}
                                            className="data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="instagramActive">Ativo</Label>
                                    </div>
                                </div>

                                {/* Facebook */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <FacebookIcon className="w-5 h-5 text-blue-500" />
                                        <Label htmlFor="facebookUrl">Facebook</Label>
                                    </div>
                                    <Input
                                        id="facebookUrl"
                                        name="facebookUrl"
                                        value={facebookUrl}
                                        onChange={(e) => setFacebookUrl(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                        placeholder="https://facebook.com/..."
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="facebookActive"
                                            checked={facebookActive}
                                            onCheckedChange={setFacebookActive}
                                            className="data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="facebookActive">Ativo</Label>
                                    </div>
                                </div>

                                {/* Twitter */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <TwitterIcon className="w-5 h-5 text-sky-500" />
                                        <Label htmlFor="twitterUrl">Twitter (X)</Label>
                                    </div>
                                    <Input
                                        id="twitterUrl"
                                        name="twitterUrl"
                                        value={twitterUrl}
                                        onChange={(e) => setTwitterUrl(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                        placeholder="https://twitter.com/..."
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="twitterActive"
                                            checked={twitterActive}
                                            onCheckedChange={setTwitterActive}
                                            className="data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="twitterActive">Ativo</Label>
                                    </div>
                                </div>

                                {/* TikTok */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <TikTokIcon className="w-5 h-5 text-purple-500" />
                                        <Label htmlFor="tiktokUrl">TikTok</Label>
                                    </div>
                                    <Input
                                        id="tiktokUrl"
                                        name="tiktokUrl"
                                        value={tiktokUrl}
                                        onChange={(e) => setTiktokUrl(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                        placeholder="https://tiktok.com/@..."
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="tiktokActive"
                                            checked={tiktokActive}
                                            onCheckedChange={setTiktokActive}
                                            className="data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="tiktokActive">Ativo</Label>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 min-w-[120px]">
                                        <WhatsAppIcon className="w-5 h-5 text-green-500" />
                                        <Label htmlFor="whatsappUrl">WhatsApp</Label>
                                    </div>
                                    <Input
                                        id="whatsappUrl"
                                        name="whatsappUrl"
                                        value={whatsappUrl}
                                        onChange={(e) => setWhatsappUrl(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                        placeholder="https://wa.me/..."
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="whatsappActive"
                                            checked={whatsappActive}
                                            onCheckedChange={setWhatsappActive}
                                            className="data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="whatsappActive">Ativo</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-6">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Salvar Alterações
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Preview Column */}
            <Card className="bg-zinc-900 border-zinc-800 text-white h-fit sticky top-4">
                <CardHeader>
                    <CardTitle>Pré-visualização (Rodapé)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 space-y-8">
                        {/* Contact */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contato</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3 text-zinc-400">
                                    <MapPin className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span>
                                        {street}, {number} {complement && `- ${complement}`}<br />
                                        {neighborhood}, {city} - {state}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-400">
                                    <Phone className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span>{phone}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Hours */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Horários</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3 text-zinc-400">
                                    <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <div>
                                        <p>Segunda a Sexta: {weekDaysOpen}h - {weekDaysClose}h</p>
                                        <p>Sábado: {saturdayOpen}h - {saturdayClose}h</p>
                                        <p>Domingo: {sundayOpen && sundayClose ? `${sundayOpen}h - ${sundayClose}h` : "Fechado"}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Social Media Preview */}
                        {(instagramActive || facebookActive || twitterActive || tiktokActive || whatsappActive) && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Redes Sociais</h4>
                                <div className="flex gap-4">
                                    {instagramActive && <InstagramIcon className="w-5 h-5 text-zinc-400" />}
                                    {facebookActive && <FacebookIcon className="w-5 h-5 text-zinc-400" />}
                                    {twitterActive && <TwitterIcon className="w-5 h-5 text-zinc-400" />}
                                    {tiktokActive && <TikTokIcon className="w-5 h-5 text-zinc-400" />}
                                    {whatsappActive && <WhatsAppIcon className="w-5 h-5 text-zinc-400" />}
                                </div>
                            </div>
                        )}

                        {/* Map Preview */}
                        <div className="h-32 rounded-lg overflow-hidden bg-zinc-900 relative border border-zinc-800">
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 z-0">
                                <span className="text-zinc-500 text-xs font-medium">Carregando Mapa...</span>
                            </div>
                            <iframe
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${street}, ${number}, ${neighborhood}, ${city}, ${state}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                className="opacity-70 hover:opacity-100 transition-opacity duration-300 relative z-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
