
import { Button } from '~/components/ui/button'; 
import { Link } from '@remix-run/react'; 

function WelcomeCard({ title, role, description, imageUrl, cardLink }: WelcomeCardProps) {
  return (
    <div className="bg-blue-50 p-10 h-full md:h-64 w-full flex flex-col md:flex-row justify-center items-center rounded-2xl">
      <div className="w-full md:w-1/2">
        <h1 className="font-semibold text-slate-900 text-2xl">
          {title} 👋 <br />
          {role}
        </h1>
        <p className="pt-2 pb-4 text-sm text-slate-500">{description}</p>
        <Link to={cardLink}>
          <Button size="sm">Get Started</Button>
        </Link>
      </div>
      <div className="hidden md:block w-1/2">
        <img
          src={imageUrl}
          alt="EduFlow"
          className="md:w-80 md:h-80 object-cover md:object-contain transform scale-x-[-1]"
        />
      </div>
    </div>
  );
}

export default WelcomeCard;
