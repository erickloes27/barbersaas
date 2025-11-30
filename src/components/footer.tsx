import { MapPin, Phone, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, TikTokIcon, WhatsAppIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { Barbershop } from "@prisma/client";

interface FooterProps {
    settings: Barbershop;
}

export function Footer({ settings }: FooterProps) {
    return (
        <footer id="contato" className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 max-w-6xl mx-auto">


                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Contato</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-zinc-400">
                                <MapPin className="w-5 h-5 shrink-0" style={{ color: settings.primaryColor }} />
                                <span>
                                    {settings.street}, {settings.number} {settings.complement && `- ${settings.complement}`}<br />
                                    {settings.neighborhood}, {settings.city} - {settings.state}
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-400">
                                <Phone className="w-5 h-5 shrink-0" style={{ color: settings.primaryColor }} />
                                <span>{settings.phone}</span>
                            </li>
                        </ul>

                        {/* Social Media */}
                        {(settings.instagramActive || settings.facebookActive || settings.twitterActive || settings.tiktokActive || settings.whatsappActive) && (
                            <div className="pt-4">
                                <h4 className="text-lg font-bold text-white mb-3">Redes Sociais</h4>
                                <div className="flex gap-4">
                                    {settings.instagramActive && settings.instagramUrl && (
                                        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                            <InstagramIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {settings.facebookActive && settings.facebookUrl && (
                                        <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                            <FacebookIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {settings.twitterActive && settings.twitterUrl && (
                                        <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                            <TwitterIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {settings.tiktokActive && settings.tiktokUrl && (
                                        <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                            <TikTokIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {settings.whatsappActive && settings.whatsappUrl && (
                                        <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                            <WhatsAppIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hours */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Horários</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-zinc-400">
                                <Clock className="w-5 h-5 shrink-0" style={{ color: settings.primaryColor }} />
                                <div>
                                    <p>Segunda a Sexta: {settings.weekDaysOpen}h - {settings.weekDaysClose}h</p>
                                    <p>Sábado: {settings.saturdayOpen}h - {settings.saturdayClose}h</p>
                                    <p>Domingo: {settings.sundayOpen && settings.sundayClose ? `${settings.sundayOpen}h - ${settings.sundayClose}h` : "Fechado"}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Map */}
                    <div className="h-48 rounded-lg overflow-hidden bg-zinc-900 relative">
                        {/* Placeholder for Map */}
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <span className="text-zinc-500 font-medium">Mapa Google Maps</span>
                        </div>
                        <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${settings.street}, ${settings.number}, ${settings.neighborhood}, ${settings.city}, ${settings.state}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="opacity-50 hover:opacity-100 transition-opacity duration-300 relative z-10"
                        />
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 text-center text-zinc-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer >
    );
}
