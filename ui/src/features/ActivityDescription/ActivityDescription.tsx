import { Fragment } from 'react';

import { Activity } from '@/api-types';
import { UserLabel } from '@/components/primitives';
import { ActivityObject } from './ActivityObject';
import { renderTemplate } from './templateParser';

type ActivityDescriptionProps = {
  activity: Activity;
};

export function ActivityDescription({ activity }: ActivityDescriptionProps) {
  const nodes = renderTemplate(activity.template, {
    actor: (
      <span className="font-semibold">
        <UserLabel user={activity.actor} />
      </span>
    ),
    object: activity.object && <ActivityObject object={activity.object} />,
    target: activity.target && <ActivityObject object={activity.target} />,
  });

  return (
    <p>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </p>
  );
}
